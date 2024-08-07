import { processFiles } from './process-files'
import { resendMessageIfExists } from './resend-message-if-exists'
import * as jsSHA from '../jssha'

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

  const chatWid = new Store.WidFactory.createWid(chatId)
  await Store.Chat.add({ createdLocally: true, id: chatWid }, { merge: true })

  try {
    const file = await downloadFile(url, allowedMimeType, filename)

    const messagePayload = {
      type: type,
      filename: filename,
      text: caption,
      mimeType: file.type,
    }

    const _chat = await Store.Chat.find(chat.id)
    const mc = await processFiles(_chat, file, type)

    const media = mc?._models?.shift()

    if (!media) throw new Error('Error to models')

    const encryptedFile = await WAPI.encryptAndUploadFileV2(media.type, file)

    if (!encryptedFile) throw new Error('Error to encryptAndUploadFile', 400)

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
      deprecatedMms3Url: encryptedFile.url,
      directPath: encryptedFile.directPath,
      encFilehash: encryptedFile.encFilehash,
      filehash: encryptedFile.filehash,
      mediaKeyTimestamp: encryptedFile.mediaKeyTimestamp,
      mimetype: media.mimetype,
      ephemeralStartTimestamp: encryptedFile.mediaKeyTimestamp,
      mediaKey: encryptedFile.mediaKey,
      size: media.filesize,
      caption,
      filename: type === 'sendPtt' ? undefined : filename,
    }

    const result = await Promise.all(
      window.Store.addAndSendMsgToChat(chat, message)
    )

    if (!result[1]) throw new Error('The message was not sent')

    return WAPI.scope(newMsgId, false, result[1], null, messagePayload)
  } catch (error) {
    return WAPI.scope(chat.id, true, 500, error.message)
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

/**
 * @param {string} url File Url
 * @param {string} filename File name
 * @returns {File} The download file as an instance of File.
 */
export async function downloadFile(url, allowedMimeTypeList, filename) {
  const response = await fetch(url)

  const mimeType = response.headers.get(`content-type`)
  if (!mimeType) {
    throw new Error(FILE_DOWNLOAD_ERROR.INVALID_MIME)
  }

  verifyAllowedMimeType(mimeType, allowedMimeTypeList)

  const reader = await response.body.getReader()

  const sha = new jsSHA('SHA-256', 'ARRAYBUFFER')
  const chunks = []
  let readResult
  do {
    readResult = await reader.read()
    if (readResult?.value) {
      chunks.push(readResult.value)
      sha.update(readResult.value)
    }
  } while (!!readResult?.value && !readResult?.done)

  const buffer = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  )

  let offset = 0
  chunks.forEach((chunk) => {
    buffer.set(chunk, offset)
    offset += chunk.length
  })

  const file = new File([buffer], filename, { type: mimeType })
  file.hash = sha.getHash('B64')
  return file
}

/**
 * @param {string} mimeType File mime type
 * @param {string[]} allowedMimeTypeList List of allowed mime types
 * @returns
 */
function verifyAllowedMimeType(mimeType, allowedMimeTypeList) {
  if (!allowedMimeTypeList) return `!allowedMimeTypeList`
  if (!Array.isArray(allowedMimeTypeList))
    throw new Error(FILE_DOWNLOAD_ERROR.INVALID_MIME_LIST)
  if (allowedMimeTypeList.length === 0) return

  if (mimeType.includes(NOT_ALLOWED_MIMETYPE.VIDEO_WEBM)) {
    throw new Error(FILE_DOWNLOAD_ERROR.CONTENT_TYPE_NOT_ALLOWED)
  }

  const isAllowed = allowedMimeTypeList?.some((mime) => {
    if (typeof mime === 'string') {
      return mimeType === mime
    }
    return mime.exec(mimeType)
  })

  if (!isAllowed) {
    throw new Error(FILE_DOWNLOAD_ERROR.CONTENT_TYPE_NOT_ALLOWED)
  }

  return isAllowed
}
