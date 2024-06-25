import { logger } from '../../utils/logger'
import axios from 'axios'
import * as fs from 'fs'
import mimeTypes from 'mime-types'

export enum NOT_ALLOWED_MIMETYPE {
  VIDEO_WEBM = 'video/webm',
}

export enum BASE64_ERROR {
  INVALID_URL_PATH = 'invalid.url.path',
  INVALID_MIME = 'invalid.mime',
  INVALID_MIME_LIST = 'invalid.mime.list',
  CONTENT_TYPE_NOT_ALLOWED = 'content.type.not.allowed',
  UNKNOWN_ERROR = 'unknown.error',
  FILE_NOT_FOUND = 'file.not.found',
}

export type base64Type = {
  data?: string
  mimeType?: string
  error?: { erro: true; text: BASE64_ERROR }
}

class Base64Management {
  getBase64MimeType(encoded: string): string | null {
    let result = null
    if (typeof encoded !== 'string') {
      return result
    }

    const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
    if (mime && mime.length) {
      result = mime[1]
    }

    return result
  }

  async getBase64(
    path: string,
    allowedMimeList?: (string | RegExp)[]
  ): Promise<base64Type> {
    const regexHttp = /^https?:/

    if (regexHttp.test(path)) {
      return this.downloadedFileToBase64(path, allowedMimeList)
    }
    return this.fileToBase64(path, allowedMimeList)
  }

  private async downloadedFileToBase64(
    path: string,
    allowedMimeList?: (string | RegExp)[]
  ): Promise<base64Type> {
    const verifyMimeType = allowedMimeList !== undefined

    if (verifyMimeType && !Array.isArray(allowedMimeList)) {
      logger.error(`set mines string array, not "${typeof allowedMimeList}" `)
      return { error: { erro: true, text: BASE64_ERROR.INVALID_MIME_LIST } }
    }

    try {
      const response = await axios.get(path, {
        responseType: 'arraybuffer',
      })

      const mimeType = response.headers['content-type']
      if (!mimeType) {
        return { error: { erro: true, text: BASE64_ERROR.INVALID_MIME } }
      }

      if (mimeType.includes(NOT_ALLOWED_MIMETYPE.VIDEO_WEBM)) {
        logger.error(`Content-Type "${mimeType}" of ${path} is not allowed`)
        return {
          error: { erro: true, text: BASE64_ERROR.CONTENT_TYPE_NOT_ALLOWED },
        }
      }

      if (
        verifyMimeType &&
        !this.verifyAllowedMimeType(mimeType, allowedMimeList)
      ) {
        logger.error(`Content-Type "${mimeType}" from ${path} is not allowed`)
        return {
          error: { erro: true, text: BASE64_ERROR.CONTENT_TYPE_NOT_ALLOWED },
        }
      }

      const content = Buffer.from(response.data, 'binary').toString('base64')

      return { data: `data:${mimeType};base64,${content}`, mimeType: mimeType }
    } catch (error) {
      logger.error(`error trying to download: ${error}`)
      return { error: { erro: true, text: BASE64_ERROR.UNKNOWN_ERROR } }
    }
  }

  private fileToBase64(
    path: string,
    allowedMimeList?: (string | RegExp)[]
  ): base64Type {
    const verifyMimeType = allowedMimeList !== undefined
    if (fs.existsSync(path)) {
      const base64 = fs.readFileSync(path, { encoding: 'base64' })
      const mimeType = mimeTypes.lookup(path)
      if (!mimeType) {
        return { error: { erro: true, text: BASE64_ERROR.INVALID_MIME } }
      }
      if (
        verifyMimeType &&
        !this.verifyAllowedMimeType(mimeType, allowedMimeList)
      ) {
        logger.error(`Content-Type "${mimeType}" from ${path} is not allowed`)
        return {
          error: { erro: true, text: BASE64_ERROR.CONTENT_TYPE_NOT_ALLOWED },
        }
      }
      return { data: `data:${mimeType};base64,${base64}`, mimeType: mimeType }
    } else {
      return { error: { erro: true, text: BASE64_ERROR.INVALID_URL_PATH } }
    }
  }

  private verifyAllowedMimeType(
    mimeType: string,
    allowedMimeList: (string | RegExp)[]
  ): boolean {
    return allowedMimeList.some((mime) => {
      if (typeof mime === 'string') {
        return mimeType === mime
      }
      return mime.exec(mimeType)
    })
  }
}

const base64Management = new Base64Management()

export { base64Management }
