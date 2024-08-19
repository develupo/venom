import { AxiosResponse } from 'axios'
import { MEDIA_PATH } from '../../Baileys/src/Defaults'
import { AnyMediaMessageContent } from '../../Baileys/src/Types'
import { audioProcessor } from '../layers/audio'
import path from 'path'
import { logger } from '../../utils/logger'

export type FileTypeCheckResult = {
  content: AnyMediaMessageContent
  mediaType: MEDIA_PATH
}

export class FileTypeChecker {
  extensionMap = {
    ico: 'image/x-icon',
    gif: 'image/gif',
    webp: 'image/webp',
    png: 'image/png',
    bmp: 'image/bmp',
    apng: 'image/apng',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    pjpeg: 'image/jpeg',
    jfif: 'image/jpeg',
    jfi: 'image/jpeg',
    pjp: 'image/jpeg',
    avif: 'image/avif',
    m4v: 'video/x-m4v',
    mp4: 'video/mp4',
    '3gp': 'video/3gpp',
    mov: 'video/quicktime',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    mp3: 'audio/mp3',
  }

  mimeTypeList = {
    image: [
      'image/x-xbitmap',
      'image/tiff',
      'image/jpeg',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/tiff',
      'image/gif',
      'image/svg+xml',
      'image/jpeg',
      'image/svg+xml',
      'image/jpeg',
      'image/webp',
      'image/png',
      'image/bmp',
      'image/jpeg',
      'image/apng',
      'image/vnd.mozilla.apng',
      'image/jpeg',
      'image/avif',
    ],
    video: ['video/x-m4v', 'video/mp4', 'video/3gpp', 'video/quicktime'],
    audio: [
      'audio/aac',
      'audio/mp4',
      'audio/x-m4a',
      'audio/ogg',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/vnd.dlna.adts',
      'audio/mp3',
    ],
    ptt: [
      'audio/aac',
      'audio/vnd.dlna.adts',
      'audio/ogg',
      'audio/mp3',
      'audio/wav',
      'audio/mpeg',
    ],
  }

  getFileContent(
    response: AxiosResponse<any, any>,
    mediaType: MEDIA_PATH,
    filename: string
  ): FileTypeCheckResult {
    const mimetype = response.headers['content-type'] as string
    const normalizedMediaType = this.normalizeMediaType(
      mediaType,
      mimetype,
      filename
    )

    let content: AnyMediaMessageContent
    switch (normalizedMediaType) {
      case MEDIA_PATH.image:
        content = {
          image: { stream: response.data },
        }
        break
      case MEDIA_PATH.video:
        content = {
          video: { stream: response.data },
        }
        break
      case MEDIA_PATH.ptt:
      case MEDIA_PATH.audio:
        content = {
          audio: {
            stream: audioProcessor.toOGG(response.data),
          },
          ptt: this.isPtt(mimetype),
        }
        break
      default:
        content = {
          document: { stream: response.data },
          mimetype,
        }
        break
    }

    return { content, mediaType: normalizedMediaType }
  }

  getFileInformation(
    mediaType: MEDIA_PATH,
    mimetype: string,
    filename: string
  ): MEDIA_PATH {
    const fileMimeTypeFromMimeType = mimetype.split('/')[0] as MEDIA_PATH
    if (fileMimeTypeFromMimeType in MEDIA_PATH) {
      return fileMimeTypeFromMimeType
    }

    if (filename) {
      try {
        const fileExtensionFromFileName = path
          .extname(filename)
          .replace(`.`, ``)
        const fileMediaTypeFromFileName =
          this.extensionMap[fileExtensionFromFileName]?.split('/')[0]

        if (!fileMediaTypeFromFileName) {
          throw new Error(`[getFileInformation] file extension not found`)
        }

        return fileMediaTypeFromFileName
      } catch (error) {
        logger.error(`[getFileInformation] failed to get file extension`)
      }
    }

    if (mediaType in MEDIA_PATH) {
      return mediaType
    }

    return MEDIA_PATH.document
  }

  normalizeMediaType(
    mediaType: MEDIA_PATH,
    mimetype: string,
    filename: string
  ): MEDIA_PATH {
    const fileMediaType = this.getFileInformation(mediaType, mimetype, filename)

    const isAudio = fileMediaType === MEDIA_PATH.audio

    if (isAudio && this.isPtt(mimetype)) {
      return MEDIA_PATH.ptt
    }

    const mimeTypeMatchesMediaType = this.mimeTypeList[fileMediaType]?.some(
      (checkMimeType) => checkMimeType === mimetype
    )

    if (!mimeTypeMatchesMediaType) {
      return MEDIA_PATH.document
    }

    return fileMediaType
  }

  isPtt(mimeType: string): boolean {
    return this.mimeTypeList.ptt.some((pptMimeType) => {
      return pptMimeType.includes(mimeType)
    })
  }
}

export const fileTypeChecker = new FileTypeChecker()
