export async function createFanoutMsgStanzaInject(oldFunction, args) {
  const [, proto] = args

  let buttonNode = null

  if (proto.viewOnceMessage?.message.listMessage) {
    const listType = proto.viewOnceMessage?.message.listMessage?.listType || 0

    const types = ['unknown', 'single_select', 'product_list']

    buttonNode = Store.Websocket.smax('list', {
      v: '2',
      type: types[listType],
    })
  }

  const node = await oldFunction(...args)

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
}
