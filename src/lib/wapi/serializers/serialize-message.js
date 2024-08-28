export const _serializeMessageObj = async (obj) => {
  if (obj === undefined) {
    return null
  }

  const chat = await WAPI.getChatById(obj.from._serialized)
  const isGroupMsg = obj?.to?.server === 'g.us' || obj?.from?.server === 'g.us'
  const groupInfo = isGroupMsg ? chat.contact : null

  return {
    ...window.WAPI._serializeRawObj(obj),
    id: obj?.id?._serialized,
    from: obj?.from?._serialized,
    quotedParticipant: obj?.quotedParticipant?._serialized
      ? obj?.quotedParticipant?._serialized
      : undefined,
    author: obj?.author?._serialized ? obj?.author?._serialized : undefined,
    chatId: obj?.id?.remote
      ? obj?.id?.remote
      : obj?.chatId?._serialized
      ? obj?.chatId?._serialized
      : undefined,
    to: obj?.to?._serialized ? obj?.to?._serialized : undefined,
    fromMe: obj?.id?.fromMe,
    sender: obj?.senderObj
      ? await WAPI._serializeContactObj(obj?.senderObj)
      : null,
    timestamp: obj?.t,
    content: obj?.body,
    body: obj?.body,
    isLink: obj?.isLink,
    isMMS: obj?.isMMS,
    isMedia: obj?.isMedia,
    isNotification: obj?.isNotification,
    isPSA: obj?.isPSA,
    type: obj?.type,
    chat: chat,
    isOnline: chat?.isOnline,
    lastSeen: chat?.lastSeen,
    quotedMsgObj: obj?.quotedMsg,
    quotedStanzaId: obj?.quotedStanzaID ? obj?.quotedStanzaID : undefined,
    mediaData: window.WAPI._serializeRawObj(obj?.mediaData),
    caption: obj?.caption,
    deprecatedMms3Url: obj?.deprecatedMms3Url,
    directPath: obj?.directPath,
    encFilehash: obj?.encFilehash,
    filehash: obj?.filehash,
    filename: obj?.filename,
    mimetype: obj?.mimetype,
    clientUrl: obj?.clientUrl,
    mediaKey: obj?.mediaKey,
    size: obj?.size,
    t: obj?.t,
    isNewMsg: obj?.isNewMsg,
    linkPreview: obj?.linkPreview,
    text: obj?.text,
    height: obj?.height,
    width: obj?.width,
    self: obj?.self,
    initialPageSize: obj?.initialPageSize,
    lat: obj?.lat ? obj.lat : undefined,
    lng: obj?.lng ? obj.lng : undefined,
    ack: obj?.ack,
    scanLengths: null,
    scansSidecar: null,
    streamingSidecar: null,
    waveform: null,
    replyButtons: null,
    dynamicReplyButtons: null,
    buttons: null,
    hydratedButtons: null,
    isGroupMsg: isGroupMsg,
    groupInfo: groupInfo,
    reply: (body) => window.WAPI.reply(chat.id._serialized, body, obj),
  }
}
