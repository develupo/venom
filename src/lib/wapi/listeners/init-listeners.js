export function initNewMessagesListener() {
  /**
   * Registers a callback to be called when a new message arrives the WAPI.
   * @param done - function - Callback function to be called when a new message arrives.
   * @returns {boolean}
   */
  window.WAPI.waitNewMessages = function (done) {
    window.WAPI._newMessagesCallbacks = (e) => {
      try {
        done(e)
      } catch (e) {
        console.error(e)
      }
    }

    return true
  }

  window.WAPI.waitForStore(['Chat', 'Msg'], () => {
    window.WAPI._newMessagesListener = window.Store.Msg.on(
      'add',
      async (newMessage) => {
        if (!newMessage?.isNewMsg || newMessage?.isSentByMe) return

        const message = await window.WAPI.processMessageObj(newMessage)
        window.WAPI._newMessagesCallbacks([message])
      }
    )
  })
}
