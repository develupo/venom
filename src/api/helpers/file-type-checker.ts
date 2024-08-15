import { AxiosResponse } from 'axios'
import { MEDIA_PATH } from '../../Baileys/src/Defaults'
import { AnyMediaMessageContent } from '../../Baileys/src/Types'

export type FileTypeCheckedResult = {
  content: AnyMediaMessageContent
  mediaType: MEDIA_PATH
}

export class FileTypeChecked {
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
  }

  pptMimeTypeList = [
    'audio/aac',
    'audio/vnd.dlna.adts',
    'audio/ogg',
    'audio/mp3',
    'audio/wav',
    'audio/mpeg',
  ]

  getFileContent(
    response: AxiosResponse<any, any>,
    mediaType: MEDIA_PATH
  ): FileTypeCheckedResult {
    let content: AnyMediaMessageContent
    const mimetype = response.headers['content-type'] as string

    if (this.verifyIfNeedsToChangeToDocument(mimetype)) {
      mediaType = MEDIA_PATH.document
    }

    switch (mediaType) {
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
      case MEDIA_PATH.audio:
        content = {
          audio: { stream: response.data },
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
    return { content, mediaType }
  }

  verifyIfNeedsToChangeToDocument(mimetype: string): boolean {
    if (mimetype === MEDIA_PATH.document) {
      return true
    }
    return !this.mimeTypeList[mimetype].includes(mimetype)
  }

  normalizeAudioType(isPtt: boolean): 'audio' | 'ptt' {
    return isPtt ? 'ptt' : 'audio'
  }

  isPtt(mimeType: string): boolean {
    return this.pptMimeTypeList.some((pptMimeType) => {
      return pptMimeType.includes(mimeType)
    })
  }
}

export const fileTypeChecker = new FileTypeChecked()
