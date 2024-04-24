// FIXME - Improvement, but didn't worked it, need to be investigated
export const injectObjects = [
  {
    id: 'createMsgProtobuf',
    wppModule: 'WAWebE2EProtoGenerator',
    callback: (func, args) => {
      const proto = func(...args)
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
    },
  },
  {
    id: 'mediaTypeFromProtobuf',
    wppModule: 'WAWebBackendJobsCommon',
    callback: (func, ...args) => {
      const [proto] = args
      if (proto.viewOnceMessage?.message.templateMessage.hydratedTemplate) {
        return func(
          proto.viewOnceMessage?.message.templateMessage.hydratedTemplate
        )
      }
      return func(...args)
    },
  },
  {
    id: 'typeAttributeFromProtobuf',
    wppModule: 'WAWebE2EProtoUtils',
    callback: (func, args) => {
      const [proto] = args

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
    },
  },
  {
    id: 'createFanoutMsgStanza',
    wppModule: 'WAWebSendMsgCreateFanoutStanza',
    callback: async (func, args) => {
      const [, proto] = args

      let buttonNode = null

      if (proto.viewOnceMessage?.message.listMessage) {
        const listType =
          proto.viewOnceMessage?.message.listMessage?.listType || 0

        const types = ['unknown', 'single_select', 'product_list']

        buttonNode = Store.Websocket.smax('list', {
          v: '2',
          type: types[listType],
        })
      }

      const node = await func(...args)

      if (!buttonNode) {
        return node
      }

      const content = node.content

      let bizNode = content.find((c) => c.tag === 'biz')

      if (!bizNode) {
        bizNode = Store.Websocket.smax('biz', {}, null)
        content.push(bizNode)
      }

      let hasButtonNode = false

      if (Array.isArray(bizNode.content)) {
        hasButtonNode = !!bizNode.content.find((c) => c.tag === buttonNode?.tag)
      } else {
        bizNode.content = []
      }

      if (!hasButtonNode) {
        bizNode.content.push(buttonNode)
      }

      return node
    },
  },
]
