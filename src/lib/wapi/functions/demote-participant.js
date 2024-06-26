export async function demoteParticipant(groupId, contactsId, done) {
  const chat = Store.Chat.get(groupId)

  if (!Array.isArray(contactsId)) {
    contactsId = [contactsId]
  }

  contactsId = await Promise.all(contactsId.map((c) => WAPI.sendExist(c)))
  contactsId = contactsId
    .filter((c) => !c.erro && c.isUser)
    .map((c) => chat.groupMetadata.participants.get(c.id))
    .filter((c) => typeof c !== 'undefined')
    .map((c) => c.id)

  if (!contactsId.length) {
    typeof done === 'function' && done(false)
    return false
  }

  await window.Store.WapQuery.demoteParticipants(chat.id, contactsId)

  const participants = contactsId.map((c) =>
    chat.groupMetadata.participants.get(c)
  )

  // NOTE - This is clicking button of add participant, it'll not return any response
  await window.Store.Participants.demoteParticipants(chat, participants)

  typeof done === 'function' && done(true)
  return true
}
