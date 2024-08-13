export async function sendFileFromMessage(message, chatId, passId) {
  const chat = await WAPI.sendExist(chatId)
  if (!chat || chat.status === 404 || !chat.id) {
    return WAPI.scope(chatId, true, 404, 'chatId not found')
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

    if (!result[1]) throw new Error('The message was not sent')

    return WAPI.scope(message.id, false, result[1], null)
  } catch (error) {
    return WAPI.scope(chat.id, true, 500, error.message)
  }
}
