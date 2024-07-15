import { Page, Browser } from 'puppeteer'
import { CreateConfig } from '../../config/create-config'
import { RetrieverLayer } from './retriever.layer'
import { checkValuesSender } from '../helpers/layers-interface'
import { BASE64_ERROR, base64Management, resizeImg } from '../helpers'
import { GroupSettings } from '../model/enum'
import { logger } from '../../utils/logger'

export class GroupLayer extends RetrieverLayer {
  constructor(
    public browser: Browser,
    public page: Page,
    session?: string,
    options?: CreateConfig
  ) {
    super(browser, page, session, options)
  }

  /**
   * Parameters to change group settings, see {@link GroupSettings for details}
   * @param {string} groupId group number
   * @param {GroupSettings} settings
   * @param {boolean} value
   */
  public async setGroupSettings(
    groupId: string,
    settings: GroupSettings,
    value: boolean
  ): Promise<Object> {
    const typeFunction = 'setGroupSettings'
    const type = 'string'
    const check = [
      {
        param: 'groupId',
        type: type,
        value: groupId,
        function: typeFunction,
        isUser: true,
      },
      {
        param: 'settings',
        type: type,
        value: settings,
        function: typeFunction,
        isUser: true,
      },
      {
        param: 'value',
        type: type,
        value: value,
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
        ({ groupId, settings, value }) => {
          return WAPI.setGroupSettings(groupId, settings, value)
        },
        { groupId, settings, value }
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - setGroupSettings] message=${error.message} error=${error.stack}`
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
   * Parameters to change group image
   * @param {string} groupId group number
   * @param {string} path of image
   */
  public async setGroupImage(groupId: string, path: string) {
    const base64 = await base64Management.getBase64(path, [
      'image/gif',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp',
    ])

    if (base64.error) {
      throw new Error(base64.error.text)
    }
    const buff = Buffer.from(
      base64.data.replace(/^data:image\/(png|jpe?g|webp);base64,/, ''),
      'base64'
    )

    if (!base64.mimeType || base64.mimeType.includes('image')) {
      const _webb64_96 = await resizeImg(buff, { width: 96, height: 96 }),
        _webb64_640 = await resizeImg(buff, { width: 640, height: 640 })
      const obj = { a: _webb64_640, b: _webb64_96 }

      let result
      try {
        result = await this.page.evaluate(
          ({ obj, groupId }) => WAPI.setProfilePic(obj, groupId),
          {
            obj,
            groupId,
          }
        )
      } catch (error) {
        logger.error(
          `[GroupLayer - setGroupImage result] message=${error.message} error=${error.stack}`
        )
      }
      return result
    } else {
      logger.error(
        `[GroupLayer - setGroupImage] Not an image, allowed formats png, jpeg and webp`
      )
      throw new Error(BASE64_ERROR.CONTENT_TYPE_NOT_ALLOWED)
    }
  }

  /**
   * Parameters to change group title
   * @param {string} groupId group number
   * @param {string} title group title
   */
  public async setGroupTitle(groupId: string, title: string): Promise<Object> {
    const typeFunction = 'setGroupTitle'
    const type = 'string'
    const check = [
      {
        param: 'groupId',
        type: type,
        value: groupId,
        function: typeFunction,
        isUser: true,
      },
      {
        param: 'title',
        type: type,
        value: title,
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
        ({ groupId, title }) => {
          return WAPI.setGroupTitle(groupId, title)
        },
        { groupId, title }
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - setGroupTitle] message=${error.message} error=${error.stack}`
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
   * Parameters to change group description
   * @param {string} groupId group number
   * @param {string} description group description
   */
  public async setGroupDescription(
    groupId: string,
    description: string
  ): Promise<Object> {
    const typeFunction = 'setGroupDescription'
    const type = 'string'
    const check = [
      {
        param: 'groupId',
        type: type,
        value: groupId,
        function: typeFunction,
        isUser: true,
      },
      {
        param: 'description',
        type: type,
        value: description,
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
        ({ groupId, description }) => {
          return WAPI.setGroupDescription(groupId, description)
        },
        { groupId, description }
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - setGroupDescription] message=${error.message} error=${error.stack}`
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
   * Retrieve all groups
   * @returns array of groups
   */
  public async getAllChatsGroups() {
    let result
    try {
      result = await this.page.evaluate(async () => {
        const chats = WAPI.getAllChats()
        return (await chats).filter((chat) => chat.kind === 'group')
      })
    } catch (error) {
      logger.error(
        `[GroupLayer - getAllChatsGroups] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieve all groups new messages
   * @returns array of groups
   */
  public async getChatGroupNewMsg() {
    let result
    try {
      await this.page.evaluate(() => {
        const chats = WAPI.getAllChatsWithNewMsg()
        return chats.filter((chat) => chat.kind === 'group')
      })
    } catch (error) {
      logger.error(
        `[GroupLayer - getChatGroupNewMsg] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Removes the host device from the group
   * @param groupId group id
   */
  public async leaveGroup(groupId: string) {
    let result
    try {
      result = this.page.evaluate(
        (groupId) => WAPI.leaveGroup(groupId),
        groupId
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - leaveGroup] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves group members as [Id] objects
   * @param groupId group id
   */
  public async getGroupMembers(groupId: string, time: string): Promise<Object> {
    const typeFunction = 'getGroupMembers'
    const type = 'string'
    const check = [
      {
        param: 'groupId',
        type: type,
        value: groupId,
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
        (groupId: string, time: string) =>
          WAPI.getGroupParticipant(groupId, time),
        groupId,
        time
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - getGroupMembers] message=${error.message} error=${error.stack}`
      )
      throw error
    }
    if (result['erro'] == true) {
      throw new Error(JSON.stringify(result))
    } else {
      return result
    }
  }

  // TODO - Remover
  // /**
  //  * Returns group members [Contact] objects
  //  * @param groupId
  //  */
  // public async getGroupMembers(groupId: string) {
  //   const membersIds = await this.getGroupMembersIds(groupId);
  //   const actions = membersIds.map((memberId) => {
  //     return this.getContact(memberId._serialized);
  //   });
  //   return Promise.all(actions);
  // }

  /**
   * Reset group invitation link
   * @param chatId
   * @returns boolean
   */
  public async revokeGroupInviteLink(chatId: string) {
    let result
    try {
      result = await this.page.evaluate(
        (chatId) => WAPI.revokeGroupInviteLink(chatId),
        chatId
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - revokeGroupInviteLink] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Generates group-invite link
   * @param chatId
   * @returns Invitation link
   */
  public async getGroupInviteLink(chatId: string) {
    let result
    try {
      result = await this.page.evaluate(
        (chatId) => WAPI.getGroupInviteLink(chatId),
        chatId
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - getGroupInviteLink] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }
  /**
   * Generates group-invite link
   * @param inviteCode
   * @returns Invite code from group link. Example: CMJYfPFqRyE2GxrnkldYED
   */
  public async getGroupInfoFromInviteLink(inviteCode: string) {
    inviteCode = inviteCode.replace('chat.whatsapp.com/', '')
    inviteCode = inviteCode.replace('invite/', '')
    inviteCode = inviteCode.replace('https://', '')
    inviteCode = inviteCode.replace('http://', '')
    let result
    try {
      result = await this.page.evaluate(
        (inviteCode) => WAPI.getGroupInfoFromInviteLink(inviteCode),
        inviteCode
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - getGroupInfoFromInviteLink] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Creates a new chat group
   * @param groupName Group name
   * @param contacts Contacts that should be added.
   * @param temporarySeconds Seconds of the expiration of temporary messages from whatsapp group. Set 0 for never.
   */
  public async createGroup(
    groupName: string,
    contacts: string | string[],
    temporarySeconds: number = 0
  ) {
    let result
    try {
      result = await this.page.evaluate(
        ({ groupName, contacts, temporarySeconds }) =>
          WAPI.createGroup(groupName, contacts, temporarySeconds),
        { groupName, contacts, temporarySeconds }
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - createGroup] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Removes participant from group
   * @param groupId Chat id ('0000000000-00000000@g.us')
   * @param participantId Participant id'000000000000@c.us'
   */
  public async removeParticipant(
    groupId: string,
    participantId: string | string[]
  ) {
    let result
    try {
      result = await this.page.evaluate(
        ({ groupId, participantId }) =>
          WAPI.removeParticipant(groupId, participantId),
        { groupId, participantId }
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - removeParticipant] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Adds participant to Group
   * @param groupId Chat id ('0000000000-00000000@g.us')
   * @param participantId Participant id'000000000000@c.us'
   */
  public async addParticipant(
    groupId: string,
    participantId: string | string[]
  ) {
    let result
    try {
      result = await this.page.evaluate(
        ({ groupId, participantId }) =>
          WAPI.addParticipant(groupId, participantId),
        { groupId, participantId }
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - addParticipant] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Promotes participant as Admin in given group
   * @param groupId Chat id ('0000000000-00000000@g.us')
   * @param participantId Participant id'000000000000@c.us'
   */
  public async promoteParticipant(
    groupId: string,
    participantId: string | string[]
  ) {
    let result
    try {
      result = await this.page.evaluate(
        ({ groupId, participantId }) =>
          WAPI.promoteParticipant(groupId, participantId),
        { groupId, participantId }
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - promoteParticipant] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Demotes admin privileges of participant
   * @param groupId Chat id ('0000000000-00000000@g.us')
   * @param participantId Participant id'000000000000@c.us'
   */
  public async demoteParticipant(
    groupId: string,
    participantId: string | string[]
  ) {
    let result
    try {
      result = await this.page.evaluate(
        ({ groupId, participantId }) =>
          WAPI.demoteParticipant(groupId, participantId),
        { groupId, participantId }
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - demoteParticipant] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Retrieves group admins
   * @param groupId Group/Chat id ('0000000000-00000000@g.us')
   */
  public async getGroupAdmins(groupId: string): Promise<Object> {
    const typeFunction = 'getGroupAdmins'
    const type = 'string'
    const check = [
      {
        param: 'groupId',
        type: type,
        value: groupId,
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
        (groupId: string) => WAPI.getGroupAdmins(groupId),
        groupId
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - getGroupAdmins] message=${error.message} error=${error.stack}`
      )
      throw new Error(JSON.stringify(result))
    }
    if (result['erro'] == true) {
      throw new Error(JSON.stringify(result))
    } else {
      return result
    }
  }
  /**
   * Join a group with invite code
   * @param inviteCode
   */
  public async joinGroup(inviteCode: string) {
    inviteCode = inviteCode.replace('chat.whatsapp.com/', '')
    inviteCode = inviteCode.replace('invite/', '')
    inviteCode = inviteCode.replace('https://', '')
    inviteCode = inviteCode.replace('http://', '')
    let result
    try {
      result = await this.page.evaluate(
        (inviteCode) => WAPI.joinGroup(inviteCode),
        inviteCode
      )
    } catch (error) {
      logger.error(
        `[GroupLayer - joinGroup] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }
}
