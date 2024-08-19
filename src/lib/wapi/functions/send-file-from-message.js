import { MESSAGE_ERRORS } from '../constants/message-errors'

function checkSendResult(result) {
  const sendResult = result?.[1]
  const sendFailed = !(
    sendResult === 'success' ||
    sendResult === 'OK' ||
    sendResult.messageSendResult === 'OK'
  )

  if (!sendResult || sendFailed) {
    return { erro: true, message: MESSAGE_ERRORS.MESSAGE_NOT_SENT }
  }
}

export async function sendFileFromMessage(message, chatId, passId) {
  const chat = await WAPI.sendExist(chatId)
  if (!chat || chat.status === 404 || !chat.id) {
    return WAPI.scope(chatId, true, 404, MESSAGE_ERRORS.INVALID_CONTACT_ID)
  }

  const newMsgId = await WAPI.setNewMessageId(passId, true)

  try {
    const fromwWid = await Store.MaybeMeUser.getMaybeMeUser()

    const messageToSend = {
      ...message,
      id: newMsgId,
      from: fromwWid,
      to: chat.id,
    }

    const result = await Promise.all(
      window.Store.addAndSendMsgToChat(chat, messageToSend)
    )

    const errorSending = checkSendResult(result)
    if (errorSending?.erro) {
      return WAPI.scope(chat.id, true, 500, errorSending.message)
    }

    return WAPI.scope(message.id, false, result[1], null)
  } catch (error) {
    return WAPI.scope(chat.id, true, 500, error.message)
  }
}
