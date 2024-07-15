import { Page, Browser } from 'puppeteer'
import { CreateConfig } from '../../config/create-config'
import { UILayer } from './ui.layer'
import { checkValuesSender } from '../helpers/layers-interface'
import { logger } from '../../utils/logger'

export class ControlsLayer extends UILayer {
  constructor(
    public browser: Browser,
    public page: Page,
    session?: string,
    options?: CreateConfig
  ) {
    super(browser, page, session, options)
  }

  /**
   * Unblock contact
   * @param contactId {string} id '000000000000@c.us'
   * @returns boolean
   */
  public async unblockContact(contactId: string) {
    let result
    try {
      result = this.page.evaluate(
        (contactId: string) => WAPI.unblockContact(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - unblockContact] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Block contact
   * @param contactId {string} id '000000000000@c.us'
   * @returns boolean
   */
  public async blockContact(contactId: string) {
    let result
    try {
      result = this.page.evaluate(
        (contactId: string) => WAPI.blockContact(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - blockContact] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Mark unread chat
   * @param contactId {string} id '000000000000@c.us'
   * @returns bollean
   */
  public async markUnseenMessage(contactId: string) {
    const typeFunction = 'markUnseenMessage'
    const type = 'string'
    const check = [
      {
        param: 'contactId',
        type: type,
        value: contactId,
        function: typeFunction,
        isUser: true,
      },
    ]

    const validating = checkValuesSender(check)
    if (typeof validating === 'object') {
      throw new Error(JSON.stringify(validating))
    }
    let result
    try {
      result = await this.page.evaluate(
        (contactId: string) => WAPI.markUnseenMessage(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - markUnseenMessage] message=${error.message} error=${error.stack}`
      )
    }

    if (result['erro'] == true) {
      throw new Error(JSON.stringify(result))
    } else {
      return result
    }
  }

  /**
   * Mark chat as read ✔️✔️
   * @param contactId {string} id '000000000000@c.us'
   * @returns boolean
   */
  public async markMarkSeenMessage(contactId: string) {
    const typeFunction = 'markMarkSeenMessage'
    const type = 'string'
    const check = [
      {
        param: 'contactId',
        type: type,
        value: contactId,
        function: typeFunction,
        isUser: true,
      },
    ]

    const validating = checkValuesSender(check)
    if (typeof validating === 'object') {
      throw new Error(JSON.stringify(validating))
    }
    let result
    try {
      result = await this.page.evaluate(
        (contactId: string) => WAPI.markMarkSeenMessage(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - markMarkSeenMessage] message=${error.message} error=${error.stack}`
      )
      throw error
    }

    if (result['erro'] == true) {
      throw new Error(JSON.stringify(result))
    } else {
      return result
    }
  }

  /**
   * Deletes the given chat
   * @param chatId {string} id '000000000000@c.us'
   * @returns boolean
   */
  public async deleteChat(chatId: string) {
    let result
    try {
      result = await this.page.evaluate(
        (chatId) => WAPI.deleteConversation(chatId),
        chatId
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - deleteChat] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Archive and unarchive chat messages with true or false
   * @param chatId {string} id '000000000000@c.us'
   * @param option {boolean} true or false
   * @returns boolean
   */
  public async archiveChat(chatId: string, option: boolean) {
    let result
    try {
      result = this.page.evaluate(
        ({ chatId, option }) => WAPI.archiveChat(chatId, option),
        { chatId, option }
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - archiveChat] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Pin and Unpin chat messages with true or false
   * @param chatId {string} id '000000000000@c.us'
   * @param option {boolean} true or false
   * @param nonExistent {boolean} Pin chat, non-existent (optional)
   * @returns object
   */
  public async pinChat(chatId: string, option: boolean, nonExistent?: boolean) {
    let result
    try {
      result = await this.page.evaluate(
        ({ chatId, option, nonExistent }) => {
          return WAPI.pinChat(chatId, option, nonExistent)
        },
        { chatId, option, nonExistent }
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - pinChat] message=${error.message} error=${error.stack}`
      )
      throw error
    }
    if (result['erro'] == true) {
      throw new Error(JSON.stringify(result))
    } else {
      return result
    }
  }

  /**
   * Deletes all messages of given chat
   * @param chatId
   * @returns boolean
   */
  public async clearChatMessages(chatId: string) {
    let result
    try {
      result = this.page.evaluate(
        (chatId) => WAPI.clearChatMessages(chatId),
        chatId
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - clearChatMessages] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Deletes message of given message id
   * @param chatId The chat id from which to delete the message.
   * @param messageId The specific message id of the message to be deleted
   * @param onlyLocal If it should only delete locally (message remains on the other recipienct's phone). Defaults to false.
   */
  public async deleteMessage(
    chatId: string,
    messageId: string[]
  ): Promise<Object> {
    const typeFunction = 'deleteMessage'
    const type = 'string'
    const check = [
      {
        param: 'chatId',
        type: type,
        value: chatId,
        function: typeFunction,
        isUser: true,
      },
      {
        param: 'messageId',
        type: 'object',
        value: messageId,
        function: typeFunction,
        isUser: true,
      },
    ]

    const validating = checkValuesSender(check)
    if (typeof validating === 'object') {
      throw new Error(JSON.stringify(validating))
    }
    let result
    try {
      result = await this.page.evaluate(
        ({ chatId, messageId }) => WAPI.deleteMessages(chatId, messageId),
        { chatId, messageId }
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - deleteMessage] message=${error.message} error=${error.stack}`
      )
      throw error
    }

    if (result['erro'] === true) {
      throw new Error(JSON.stringify(result))
    } else {
      return result
    }
  }

  /**
   * // FIXME - Documentation wrong
   * Archive and unarchive chat messages with true or false
   * @param chatId {string} id '000000000000@c.us'
   * @param option {boolean} true or false
   * @returns boolean
   */
  public async setMessagesAdminsOnly(chatId: string, option: boolean) {
    let result
    try {
      result = this.page.evaluate(
        ({ chatId, option }) => WAPI.setMessagesAdminsOnly(chatId, option),
        { chatId, option }
      )
    } catch (error) {
      logger.error(
        `[ControlsLayer - setMessagesAdminOnly] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  public async reload() {
    try {
      await this.page.evaluate(() => {
        window.location.reload()
      })
    } catch (error) {
      logger.error(
        `[ControlsLayer - reload] message=${error.message} error=${error.stack}`
      )
    }
  }
}
