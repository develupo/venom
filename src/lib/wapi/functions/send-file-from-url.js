import { processFiles } from './process-files'
import { resendMessageIfExists } from './resend-message-if-exists'

export const FILE_DOWNLOAD_ERROR = {
  INVALID_URL_PATH: 'invalid.url.path',
  INVALID_MIME: 'invalid.mime',
  INVALID_MIME_LIST: 'invalid.mime.list',
  CONTENT_TYPE_NOT_ALLOWED: 'content.type.not.allowed',
  UNKNOWN_ERROR: 'unknown.error',
  FILE_NOT_FOUND: 'file.not.found',
}

export const NOT_ALLOWED_MIMETYPE = {
  VIDEO_WEBM: 'video/webm',
}

export async function sendFileFromUrl(
  chatId,
  url,
  caption,
  passId,
  filename,
  allowedMimeType,
  type = 'sendFile'
) {
  const errorValidation = validateParameters(chatId, caption, filename, type)
  if (errorValidation) {
    return WAPI.scope(chatId, true, 400, errorValidation)
  }

  const chat = await WAPI.sendExist(chatId)
  if (!chat || chat.status === 404 || !chat.id) {
    return WAPI.scope(chatId, true, 404, 'chatId not found')
  }

  const inChat = await WAPI.getchatId(chat.id).catch(() => {
    return WAPI.scope(chat.id, true, 404, 'Error to number ' + chatId)
  })

  if (inChat) {
    chat.lastReceivedKey && chat.lastReceivedKey._serialized
      ? (chat.lastReceivedKey._serialized = inChat._serialized)
      : ''
    chat.lastReceivedKey && chat.lastReceivedKey.id
      ? (chat.lastReceivedKey.id = inChat.id)
      : ''
  }

  const newMsgId = passId
    ? await window.WAPI.setNewMessageId(passId, true)
    : await window.WAPI.getNewMessageId(chat.id._serialized, true)

  if (!newMsgId) {
    return WAPI.scope(chat.id, true, 404, 'Error to newId')
  }

  const resultResend = await resendMessageIfExists(passId, newMsgId)
  if (resultResend.exists) {
    return WAPI.scope(
      chat.id,
      resultResend.scope.error,
      resultResend.scope.status,
      resultResend.scope.msg
    )
  }
  let mediaBlob
  try {
    mediaBlob = await downloadFile(url, allowedMimeType, filename)
  } catch (error) {
    if (error.message === FILE_DOWNLOAD_ERROR.CONTENT_TYPE_NOT_ALLOWED) {
      return WAPI.scope(
        chatId,
        true,
        400,
        FILE_DOWNLOAD_ERROR.CONTENT_TYPE_NOT_ALLOWED
      )
    }
    return WAPI.scope(chatId, true, 400, FILE_DOWNLOAD_ERROR.UNKNOWN_ERROR)
  }

  const chatWid = new Store.WidFactory.createWid(chatId)
  await Store.Chat.add({ createdLocally: true, id: chatWid }, { merge: true })

  const m = {
    type: type,
    filename: filename,
    text: caption,
    mimeType: mediaBlob.type,
  }

  try {
    const _chat = await Store.Chat.find(chat.id)
    const mc = await processFiles(_chat, mediaBlob, type)

    if (mc && mc._models && mc._models[0]) {
      const media = mc._models[0]
      const enc = await WAPI.encryptAndUploadFile(media.type, mediaBlob)

      if (!enc) {
        throw new Error('Error to encryptAndUploadFile', 400)
      }

      const fromwWid = await Store.MaybeMeUser.getMaybeMeUser()
      const message = {
        id: newMsgId,
        ack: 0,
        from: fromwWid,
        to: chat.id,
        local: true,
        self: 'out',
        t: Math.floor(Date.now() / 1000),
        isNewMsg: true,
        invis: true,
        type: type === 'sendPtt' ? 'ptt' : media.type,
        duration:
          type === 'sendPtt' ? media?.__x_mediaPrep?._mediaData?.duration : '',
        deprecatedMms3Url: enc.url,
        directPath: enc.directPath,
        encFilehash: enc.encFilehash,
        filehash: enc.filehash,
        mediaKeyTimestamp: enc.mediaKeyTimestamp,
        mimetype: media.mimetype,
        ephemeralStartTimestamp: enc.mediaKeyTimestamp,
        mediaKey: enc.mediaKey,
        size: media.filesize,
        caption,
        filename: type === 'sendPtt' ? undefined : filename,
      }

      const result = await Promise.all(
        window.Store.addAndSendMsgToChat(chat, message)
      )
      if (result[1]) {
        return WAPI.scope(newMsgId, false, result[1], null, m)
      } else {
        throw new Error('The message was not sent')
      }
    } else {
      throw new Error('Error to models')
    }
  } catch (e) {
    return WAPI.scope(chat.id, true, 500, e.message)
  }
}

function validateParameters(chatId, caption, filename, type) {
  if (typeof filename !== 'string' && type !== 'sendPtt') {
    return 'incorrect parameter filename, insert a string for files other than sendPtt'
  }

  if (typeof chatId !== 'string' || chatId.length === 0) {
    return 'incorrect parameter chatId, insert a string.'
  }

  if (caption && typeof caption !== 'string') {
    return 'incorrect parameter caption, insert a string'
  }
}

async function downloadFile(url, allowedMimeTypes, filename) {
  const response = await fetch(url)
  const mimeType = response.headers.get('content-type')
  if (allowedMimeTypes) {
    verifyAllowedMimeType(mimeType, allowedMimeTypes, url)
  }
  return new File([await response.arrayBuffer()], filename, {
    type: mimeType,
  })
}

function verifyAllowedMimeType(mimeType, allowedMimeList, url) {
  if (mimeType.includes(NOT_ALLOWED_MIMETYPE.VIDEO_WEBM)) {
    console.error(`Content-Type "${mimeType}" of ${url} is not allowed`)
    throw new Error(FILE_DOWNLOAD_ERROR.CONTENT_TYPE_NOT_ALLOWED)
  }

  const isAllowed = allowedMimeList.some((mime) => {
    if (typeof mime === 'string') {
      return mimeType === mime
    }
    return mime.exec(mimeType)
  })
  if (!isAllowed) {
    console.error(`Content-Type "${mimeType}" from ${url} is not allowed`)
    throw new Error(FILE_DOWNLOAD_ERROR.CONTENT_TYPE_NOT_ALLOWED)
  }
  return isAllowed
}
