export async function deleteMessages(chatId, messageArray) {
  if (typeof chatId != 'string') {
    return WAPI.scope(null, true, 404, 'enter the chatid variable as an string')
  }

  if (messageArray.some((msg) => !msg.includes('true'))) {
    return WAPI.scope(null, true, 404, 'Some messages are not valid')
  }

  const chat = await WAPI.sendExist(chatId)

  if (!chat || chat.status == 404) {
    return WAPI.scope(chat, true, 404, 'Chat not found')
  }

  if (!Array.isArray(messageArray)) {
    return WAPI.scope(
      chat,
      true,
      404,
      'enter the message identification variable as an array'
    )
  }

  const messagesToDelete = await Promise.all(
    messageArray.map(async (msgId) => {
      WAPI.getMessageById(msgId, null, false)
    })
  )

  let error, result

  try {
    result = await Store.sendRevokeMsgs(
      chat,
      {
        list: messagesToDelete,
      },
      true
    )
  } catch (e) {
    error = e?.message || 'The messages has not been deleted'
  }

  const scope = await WAPI.scope(error ? null : chat.id, !!error, result, error)

  return { type: 'deleteMessages', ...scope }
}
