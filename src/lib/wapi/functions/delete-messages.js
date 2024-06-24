export async function deleteMessages(chatId, messageArray) {
  if (typeof chatId != 'string') {
    return WAPI.scope(null, true, 404, 'enter the chatid variable as an string')
  }

  if (messageArray.some((msg) => msg.includes('true'))) {
    return WAPI.scope(null, true, 404, 'Some messages are not valid')
  }
  const chat = await WAPI.sendExist(chatId)

  if (chat && chat.status != 404) {
    if (!Array.isArray(messageArray)) {
      return WAPI.scope(
        chat,
        true,
        404,
        'enter the message identification variable as an array'
      )
    }

    for (const i in messageArray) {
      if (typeof messageArray[i] === 'string') {
        const checkID = await WAPI.checkIdMessage(chatId, messageArray[i])
        if (checkID?.erro && checkID?.erro == true) {
          return checkID
        }
      }
    }

    const messagesToDelete = await Promise.all(
      messageArray.map((msgId) => WAPI.getMessageById(msgId, null, false))
    )

    const To = chat.id
    const m = { type: 'deleteMessages' }
    try {
      var result = await Store.sendRevokeMsgs(
        chat,
        {
          list: messagesToDelete,
        },
        true
      )

      const obj = WAPI.scope(To, !!result, result, '')
      Object.assign(obj, m)
      return obj
    } catch (e) {
      const obj = WAPI.scope(
        null,
        true,
        result,
        'The messages has not been deleted'
      )
      Object.assign(obj, m)
      return obj
    }
  } else {
    if (!chat.erro) {
      chat.erro = true
    }
    return chat
  }
}
