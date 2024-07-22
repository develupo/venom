import * as crypto from 'node:crypto'
import hkdf from 'futoin-hkdf'
import { ResponseType } from 'axios'
import { Message } from '../model'
import { PassThrough, Stream, Transform } from 'node:stream'

export const makeOptions = (useragentOverride: string) => ({
  responseType: 'stream' as ResponseType,
  headers: {
    'User-Agent': processUA(useragentOverride),
    DNT: 1,
    'Upgrade-Insecure-Requests': 1,
    origin: 'https://web.whatsapp.com/',
    referer: 'https://web.whatsapp.com/',
  },
})

export const timeout = (ms: number) => new Promise((res) => setTimeout(res, ms))
export const mediaTypes = {
  IMAGE: 'Image',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  PTT: 'Audio',
  DOCUMENT: 'Document',
  STICKER: 'Image',
}

export const processUA = (userAgent: string) => {
  let ua =
    userAgent ||
    'WhatsApp/2.2108.8 Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
  if (!ua.includes('WhatsApp')) ua = 'WhatsApp/2.2108.8 ' + ua
  return ua
}

class PaddingTransform extends Transform {
  decipher
  bufferedData
  bufferedLength
  expectedSize
  paddingSize
  _push: (chunk: any) => void

  constructor(blockSize, decipher, expectedSize, options?) {
    super(options)
    this.decipher = decipher
    this.expectedSize = expectedSize
    this.bufferedData = Buffer.alloc(0)
    this.bufferedLength = 0
    this.paddingSize = blockSize - (this.expectedSize % blockSize)
  }

  _transform(chunk, encoding, callback) {
    const chunkDeciphered = this.decipher.update(chunk)

    this.bufferedLength += chunkDeciphered.length

    if (this.bufferedLength <= this.expectedSize || this.paddingSize <= 0) {
      this.push(chunkDeciphered)
    } else {
      this.bufferedData = Buffer.concat([this.bufferedData, chunkDeciphered])
    }

    callback()
  }

  _flush(callback) {
    if (this.bufferedData.length > 0) {
      if (this.expectedSize + this.paddingSize === this.bufferedLength) {
        // console.log(`trimmed: ${this.paddingSize} bytes`)
        this.bufferedData = this.bufferedData.subarray(
          0,
          this.bufferedData.length - this.paddingSize
        )
      } else if (this.bufferedLength + this.paddingSize === this.expectedSize) {
        // console.log(`adding: ${this.paddingSize} bytes`)
        const padding = Buffer.alloc(this.paddingSize, this.paddingSize)
        this.bufferedData = Buffer.concat([this.bufferedData, padding])
      }

      this.push(this.bufferedData)
    }
    callback()
  }
}

export const magix = (fileStream: Stream, message: Message) => {
  const mediaKeyBase64 = message.mediaKey
  const mediaType = message.type

  const hash: string = 'sha256'
  const info = `WhatsApp ${mediaTypes[mediaType.toUpperCase()]} Keys`
  const salt: Buffer = Buffer.alloc(32)
  const expandedSize = 112

  const mediaKeyBytes: Buffer = Buffer.from(mediaKeyBase64, 'base64')
  const mediaKeyExpanded = hkdf(mediaKeyBytes, expandedSize, {
    salt,
    info,
    hash,
  })
  const iv = mediaKeyExpanded.subarray(0, 16)
  const cipherKey = mediaKeyExpanded.subarray(16, 48)

  const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv)

  const paddingTransform = new PaddingTransform(16, decipher, message.size)
  const passThrough = new PassThrough()

  fileStream.pipe(paddingTransform).pipe(passThrough)

  return { fileName: message.filename, id: message.id, passThrough }
}
