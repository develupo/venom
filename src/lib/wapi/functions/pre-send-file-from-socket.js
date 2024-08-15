import { MESSAGE_ERRORS } from '../constants/message-errors'
import { resendMessageIfExists } from './resend-message-if-exists'

export async function preSendFileFromSocket(chatId, passId) {
  const chat = await WAPI.sendExist(chatId)
  if (chat.erro) {
    return chat
  }

  const newMessageId = passId
    ? await window.WAPI.setNewMessageId(passId, true)
    : await window.WAPI.getNewMessageId(chat.id._serialized, true)
  if (!newMessageId) {
    return WAPI.scope(null, true, 400, MESSAGE_ERRORS.INVALID_ID)
  }

  const resultResend = await resendMessageIfExists(passId, newMessageId)
  if (resultResend.exists) {
    return WAPI.scope(
      chat.id,
      resultResend.scope.error,
      resultResend.scope.status,
      resultResend.scope.msg
    )
  }

  const maybeMeUser = Store.MaybeMeUser.getMaybeMeUser()
  if (!maybeMeUser?._serialized) {
    return WAPI.scope(null, true, 404, MESSAGE_ERRORS.HOST_NOT_FOUND)
  }

  return {
    newMessageId: newMessageId,
    instanceNumber: maybeMeUser._serialized,
  }
}
