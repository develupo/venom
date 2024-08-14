function checkSendResult(result) {
  const sendResult = result?.[1]
  const sendFailed = !(
    sendResult === 'success' ||
    sendResult === 'OK' ||
    sendResult.messageSendResult === 'OK'
  )

  if (!sendResult || sendFailed) throw new Error('The message was not sent')
}

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
      id: newMsgId, // TODO - Talvez remover por meio de serialização
      from: fromwWid, // TODO - Talvez remover por meio de serialização
      to: chat.id, // TODO - Talvez remover por meio de serialização
    }

    const result = await Promise.all(
      window.Store.addAndSendMsgToChat(chat, messageToSend)
    )

    checkSendResult(result)

    return WAPI.scope(message.id, false, result[1], null)
  } catch (error) {
    return WAPI.scope(chat.id, true, 500, error.message)
  }
}
