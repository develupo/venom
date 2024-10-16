export function mediaTypeFromProtobufInject(oldFunction, ...args) {
  const [proto] = args
  if (proto.viewOnceMessage?.message.templateMessage.hydratedTemplate) {
    return oldFunction(
      proto.viewOnceMessage?.message.templateMessage.hydratedTemplate
    )
  }
  return oldFunction(...args)
}
