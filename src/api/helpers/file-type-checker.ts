import { AxiosResponse } from 'axios'
import { MEDIA_PATH } from '../../Baileys/src/Defaults'
import { AnyMediaMessageContent } from '../../Baileys/src/Types'

export class FileTypeChecked {
  getFileContent(
    response: AxiosResponse<any, any>,
    mediaType: keyof typeof MEDIA_PATH
  ): AnyMediaMessageContent {
    let content: AnyMediaMessageContent
    const mimeType = response.headers['content-type'] as string
    switch (mediaType) {
      case MEDIA_PATH.image:
        content = {
          image: { stream: response.data },
        }
        return content
      case MEDIA_PATH.video:
        content = {
          video: { stream: response.data },
        }
        return content
      case MEDIA_PATH.audio:
        content = {
          audio: { stream: response.data },
          ptt: this.isPtt(mimeType),
        }
        return content
      default:
        content = {
          document: { stream: response.data },
          mimetype: mimeType,
        }
        return content
    }
  }

  normalizeAudioType(isPtt: boolean): 'audio' | 'ptt' {
    return isPtt ? 'ptt' : 'audio'
  }

  isPtt(mimeType: string): boolean {
    const pptMimeTypeList = [
      'audio/aac',
      'audio/vnd.dlna.adts',
      'audio/ogg',
      'audio/mp3',
      'audio/wav',
    ]

    return pptMimeTypeList.some((pptMimeType) => {
      return pptMimeType.includes(mimeType)
    })
  }
}

export const fileTypeChecker = new FileTypeChecked()
