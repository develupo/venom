import { sendScopeError } from '../helper/sendScopeError'

export async function deleteMessages(chatId, messageArray) {
  if (typeof chatId != 'string') {
    return sendScopeError(412, 'chat.must.be.string')
  }

  if (messageArray.some((msg) => !msg.includes('true'))) {
    return sendScopeError(412, 'some.messages.are.not.valid')
  }

  const chat = await WAPI.sendExist(chatId)

  if (!chat || chat.status == 404) {
    return sendScopeError(404, 'chat.not.found')
  }

  if (!Array.isArray(messageArray)) {
    return sendScopeError(412, 'messages.must.be.an.array')
  }

  const messagesToDelete = await Promise.all(
    messageArray.map((msgId) => WAPI.getMessageById(msgId, null, false))
  )

  if (messagesToDelete.some((msg) => !msg)) {
    return sendScopeError(412, 'some.messages.are.not.valid')
  }

  let result

  try {
    result = await Store.sendRevokeMsgs(
      chat,
      {
        list: messagesToDelete,
      },
      true
    )
  } catch (e) {
    return sendScopeError(
      500,
      JSON.stringify(e?.message) || 'messages.has.not.been.deleted'
    )
  }

  const scope = await WAPI.scope(chat.id, false, result, null)

  return { type: 'deleteMessages', ...scope }
}
