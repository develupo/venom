import { Page, Browser } from 'puppeteer'
import { CreateConfig } from '../../config/create-config'
import { WhatsappProfile } from '../model'
import { SenderLayer } from './sender.layer'
import { checkValuesSender } from '../helpers/layers-interface'
import { logger } from '../../utils/logger'

export class RetrieverLayer extends SenderLayer {
  constructor(
    public browser: Browser,
    public page: Page,
    session?: string,
    options?: CreateConfig
  ) {
    super(browser, page, session, options)
  }

  /**
 * Return messages by dates!
 * @param {string} id contact number id
 * @param {string} type 
  types:
  lowerThan: Return all messages after the date informed;
  higherThan: Return all messages before the date informed;
  equal: Return all messages from the informed date;
  full: Return all messages, with two new stringdate parameters, dateNumeric;
 * @param {string} date Pass the example date 00/00/0000 or 00-00-0000
 * @param {string} date Pass the example time 00:00 24 hours
 */
  public async getAllMessagesDate(
    chatId: string,
    type: string,
    idateStart: string,
    time: string,
    limit: number
  ) {
    let result
    try {
      result = await this.page.evaluate(
        ({ chatId, type, idateStart, time, limit }) =>
          WAPI.getAllMessagesDate(chatId, type, idateStart, time, limit),
        { chatId, type, idateStart, time, limit }
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getAllMessagesDate] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  public async getNewMessageId(chatId: string) {
    const typeFunction = 'getNewMessageId'
    const type = 'string'
    const check = [
      {
        param: 'text',
        type: type,
        value: chatId,
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
        (chatId: string) => WAPI.getNewMessageId(chatId),
        chatId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getNewMessageId] message=${error.message} error=${error.stack}`
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
   * Returns a list of mute and non-mute users
   * @param type return type: all, toMute and noMute.
   * @returns obj
   */
  public async getListMutes(type?: string) {
    let result
    try {
      result = await this.page.evaluate(
        (type: string) => WAPI.getListMute(type),
        type
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getListMutes] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Returns state connection
   * @returns obj
   */
  public async getStateConnection() {
    let result
    try {
      result = await this.page.evaluate(() => WAPI.getStateConnection())
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getStateConnection] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Receive the current theme
   * @returns string light or dark
   */
  public async getTheme() {
    let result
    try {
      result = await this.page.evaluate(() => WAPI.getTheme())
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getTheme] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Receive all blocked contacts
   * @returns array of [0,1,2,3....]
   */
  public async getBlockList() {
    let result
    try {
      result = await this.page.evaluate(() => WAPI.getBlockList())
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getBlockList] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves all chats
   * @returns array of [Chat]
   */
  public async getAllChats() {
    let result
    try {
      result = await this.page.evaluate(() => {
        const chats = WAPI.getAllChats()
        return chats
      })
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getAllChats] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves all chats new messages
   * @returns array of [Chat]
   */
  public async getAllChatsNewMsg() {
    let result
    try {
      await this.page.evaluate(() => {
        const chats = WAPI.getAllChatsWithNewMsg()
        return chats
      })
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getAllChatsNewMsg] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves all chats Contacts
   * @returns array of [Chat]
   */
  public async getAllChatsContacts() {
    let result
    try {
      result = await this.page.evaluate(async () => {
        const chats = WAPI.getAllChats(),
          filter = (await chats).filter((chat) => chat.kind === 'chat')
        return filter
      })
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getAllChatsContacts] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * NOTE - description wrong?
   * Checks if a number is a valid WA number
   * @param contactId, you need to include the @c.us at the end.
   * @returns contact detial as promise
   */
  public async checkNumberStatus(contactId: string): Promise<WhatsappProfile> {
    let result: WhatsappProfile
    try {
      result = await this.page.evaluate(
        (contactId) => WAPI.checkNumberStatus(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - checkNumberStatus] message=${error.message} error=${error.stack}`
      )
      throw error
    }
    if (result['status'] !== 200) {
      throw new Error(JSON.stringify(result))
    } else {
      return result
    }
  }

  /**
   * Retrieves all chats with messages
   * @returns array of [Chat]
   */
  public async getAllChatsWithMessages(withNewMessageOnly = false) {
    let result
    try {
      result = this.page.evaluate(
        (withNewMessageOnly: boolean) =>
          WAPI.getAllChatsWithMessages(withNewMessageOnly),
        withNewMessageOnly
      )
    } catch (error) {
      logger.error(error)
    }
    return result
  }

  /**
   * Retrieve all contact new messages
   * @returns array of groups
   */
  public async getChatContactNewMsg() {
    let chats = []
    try {
      chats = await this.page.evaluate(() => WAPI.getAllChatsWithNewMsg())
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getChatContactNewMsg] message=${error.message} error=${error.stack}`
      )
    }
    return chats.filter((chat) => chat.kind === 'chat')
  }

  /**
   * Retrieves contact detail object of given contact id
   * @param contactId
   * @returns contact detial as promise
   */
  public async getContact(contactId: string) {
    let result
    try {
      result = this.page.evaluate(
        (contactId) => WAPI.getContact(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getContact] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves all contacts
   * @returns array of [Contact]
   */
  public async getAllContacts() {
    let result
    try {
      result = await this.page.evaluate(() => WAPI.getAllContacts())
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getAllContacts] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves all chats Transmission list
   * @returns array of [Chat]
   */
  public async getAllChatsTransmission() {
    let result
    try {
      result = await this.page.evaluate(async () => {
        const chats = WAPI.getAllChats()
        return (await chats).filter((chat) => chat.kind === 'broadcast')
      })
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getAllChatsTransmission] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves chat object of given contact id
   * @param contactId
   * @returns contact detial as promise
   */
  public async getChatById(contactId: string) {
    let result
    try {
      result = await this.page.evaluate(
        (contactId) => WAPI.getChatById(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getChatById] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves chat object of given contact id
   * @param contactId
   * @returns contact detial as promise
   * @deprecated
   */
  // TODO - Remover
  public async getChat(contactId: string) {
    let result
    try {
      result = await this.getChatById(contactId)
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getChat] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves chat picture
   * @param chatId Chat id
   * @returns url of the chat picture or undefined if there is no picture for the chat.
   */
  public async getProfilePicFromServer(chatId: string) {
    let result
    try {
      result = this.page.evaluate(
        (chatId) => WAPI.getProfilePicFromServer(chatId),
        chatId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getProfilePicFromServer] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Load more messages in chat object from server. Use this in a while loop
   * @param contactId
   * @returns contact detial as promise
   * @deprecated
   */
  public async loadEarlierMessages(contactId: string) {
    let result
    try {
      result = this.page.evaluate(
        (contactId: string) => WAPI.loadEarlierMessages(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - loadEarlierMessages] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves status of given contact
   * @param contactId
   */
  public async getStatus(contactId: string) {
    let result
    try {
      this.page.evaluate(
        (contactId: string) => WAPI.getStatus(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getStatus] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Checks if a number is a valid whatsapp number
   * @param contactId, you need to include the @c.us at the end.
   * @returns contact detial as promise
   */
  public async getNumberProfile(contactId: string) {
    const typeFunction = 'getNumberProfile'
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
      result = this.page.evaluate(
        (contactId: string) => WAPI.getNumberProfile(contactId),
        contactId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getNumberProfile] message=${error.message} error=${error.stack}`
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
   * check if it's beta
   * @returns boolean
   */
  public async isBeta() {
    let result
    try {
      result = await this.page.evaluate(() => WAPI.isBeta())
    } catch (error) {
      logger.error(
        `[RetrieverLayer - isBeta] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves all undread Messages
   */
  public async getUnreadMessages(unread?: boolean) {
    let result
    try {
      result = await this.page.evaluate(
        (unread) => WAPI.getUnreadMessages(unread),
        unread
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getUnreadMessages] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves all messages already loaded in a chat
   * For loading every message use loadAndGetAllMessagesInChat
   * @param chatId, the chat to get the messages from
   * @param includeMe, include my own messages? boolean
   * @param includeNotifications
   * @returns any
   */
  public async getAllMessagesInChat(
    chatId: string,
    includeMe: boolean,
    includeNotifications: boolean
  ) {
    let result
    try {
      result = await this.page.evaluate(
        ({ chatId, includeMe, includeNotifications }) =>
          WAPI.getAllMessagesInChat(chatId, includeMe, includeNotifications),
        { chatId, includeMe, includeNotifications }
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getAllMessagesInChat] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Loads and Retrieves all Messages in a chat
   * @param chatId, the chat to get the messages from
   * @param includeMe, include my own messages? boolean
   * @param includeNotifications
   * @returns any
   */
  public async loadAndGetAllMessagesInChat(
    chatId: string,
    includeMe = false,
    includeNotifications = false
  ) {
    let result
    try {
      result = await this.page.evaluate(
        ({ chatId, includeMe, includeNotifications }) =>
          WAPI.loadAndGetAllMessagesInChat(
            chatId,
            includeMe,
            includeNotifications
          ),
        { chatId, includeMe, includeNotifications }
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - loadAndGetAllMessagesInChat] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Checks if a CHAT contact is online.
   * @param chatId chat id: xxxxx@c.us
   */
  public async getChatIsOnline(chatId: string): Promise<boolean> {
    let result
    try {
      result = await this.page.evaluate(
        (chatId: string) => WAPI.getChatIsOnline(chatId),
        chatId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getChatIsOnline] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves the last seen of a CHAT.
   * @param chatId chat id: xxxxx@c.us
   */
  public async getLastSeen(chatId: string): Promise<number | boolean> {
    let result
    try {
      result = await this.page.evaluate(
        (chatId: string) => WAPI.getLastSeen(chatId),
        chatId
      )
    } catch (error) {
      logger.error(
        `[RetrieverLayer - getLastSeen] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }
}
