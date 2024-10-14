export function createMsgProtobufInject(oldFunction, args) {
  const proto = oldFunction(...args)
  const [message] = args

  if (proto.listMessage) {
    proto.viewOnceMessage = {
      message: {
        listMessage: proto.listMessage,
      },
    }
    delete proto.listMessage
  }

  if (proto.buttonsMessage) {
    proto.viewOnceMessage = {
      message: {
        buttonsMessage: proto.buttonsMessage,
      },
    }
    delete proto.buttonsMessage
  }

  if (proto.templateMessage) {
    proto.viewOnceMessage = {
      message: {
        templateMessage: proto.templateMessage,
      },
    }
    delete proto.templateMessage
  }

  if (message.hydratedButtons) {
    const hydratedTemplate = {
      hydratedButtons: message.hydratedButtons,
    }

    if (message.footer) {
      hydratedTemplate.hydratedFooterText = message.footer
    }

    if (message.caption) {
      hydratedTemplate.hydratedContentText = message.caption
    }

    if (message.title) {
      hydratedTemplate.hydratedTitleText = message.title
    }

    if (proto.conversation) {
      hydratedTemplate.hydratedContentText = proto.conversation
      delete proto.conversation
    } else if (proto.extendedTextMessage?.text) {
      hydratedTemplate.hydratedContentText = proto.extendedTextMessage.text
      delete proto.extendedTextMessage
    } else {
      // Search media part in message
      let found
      const mediaPart = [
        'documentMessage',
        'imageMessage',
        'locationMessage',
        'videoMessage',
      ]
      for (const part of mediaPart) {
        if (part in proto) {
          found = part
          break
        }
      }

      if (!found) {
        return proto
      }

      // Media message doesn't allow title
      hydratedTemplate[found] = proto[found]

      // Copy title to caption if not setted
      if (
        hydratedTemplate.hydratedTitleText &&
        !hydratedTemplate.hydratedContentText
      ) {
        hydratedTemplate.hydratedContentText =
          hydratedTemplate.hydratedTitleText
      }

      // Remove title for media messages
      delete hydratedTemplate.hydratedTitleText

      if (found === 'locationMessage') {
        if (
          !hydratedTemplate.hydratedContentText &&
          (proto[found].name || proto[found].address)
        ) {
          hydratedTemplate.hydratedContentText =
            proto[found].name && proto[found].address
              ? `${proto[found].name}\n${proto[found].address}`
              : proto[found].name || proto[found].address || ''
        }
      }

      // Ensure a content text;
      hydratedTemplate.hydratedContentText =
        hydratedTemplate.hydratedContentText || ' '

      delete proto[found]
    }

    proto.templateMessage = {
      hydratedTemplate,
    }
  }

  return proto
}
