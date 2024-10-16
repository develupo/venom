export function typeAttributeFromProtobufInject(_, args) {
  const [proto] = args
  // console.log(`proto`, proto)

  if (proto.viewOnceMessage?.message.listMessage) {
    return 'text'
  }

  if (proto.imageMessage || proto.audioMessage) {
    return 'text'
  }

  if (
    proto.viewOnceMessage?.message?.buttonsMessage?.headerType === 1 ||
    proto.viewOnceMessage?.message?.buttonsMessage?.headerType === 2
  ) {
    return 'text'
  }

  if (proto.viewOnceMessage?.message.templateMessage.hydratedTemplate) {
    return 'text'
  }

  return 'text'
}
