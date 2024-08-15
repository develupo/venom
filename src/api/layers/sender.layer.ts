import * as path from 'path'
import { Page, Browser } from 'puppeteer'
import { CreateConfig } from '../../config/create-config'
import {
  stickerSelect,
  dowloadMetaFileBase64,
  base64Management,
  BASE64_ERROR,
} from '../helpers'
import { filenameFromMimeType } from '../helpers/filename-from-mimetype'
import { Message, SendFileResult, SendStickerResult } from '../model'
import { ChatState } from '../model/enum'
import { AutomateLayer } from './automate.layer'
import { Scope, checkValuesSender } from '../helpers/layers-interface'
import { logger } from '../../utils/logger'
import {
  encodeBase64EncodedStringForUpload,
  generateWAMessage,
  getContentType,
  getUrlInfo,
  MEDIA_PATH,
  MEDIA_PATH_MAP,
  WAMediaUploadFunction,
} from '../../Baileys/src'
import axios from 'axios'
import { fileTypeChecker } from '../helpers/file-type-checker'

export class SenderLayer extends AutomateLayer {
  constructor(
    public browser: Browser,
    public page: Page,
    session?: string,
    options?: CreateConfig
  ) {
    super(browser, page, session, options)
  }

  public async createCommunity(name: string, description: string) {
    return await this.page.evaluate(
      ({ name, description }) => {
        return WAPI.createCommunity(name, description)
      },
      { name, description }
    )
  }

  /**
   * Send List menu
   * @param to the numberid xxx@c.us
   * @param title the titulo
   * @param subtitle the subtitle
   * @param description the description
   * @param buttonText the name button
   * @param menu List menu
   */
  public async sendListMenu(
    to: string,
    title: string,
    subTitle: string,
    description: string,
    buttonText: string,
    menu: Array<any>
  ): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      const result = await this.page.evaluate(
        ({ to, title, subTitle, description, buttonText, menu }) => {
          return WAPI.sendListMenu(
            to,
            title,
            subTitle,
            description,
            buttonText,
            menu
          )
        },
        { to, title, subTitle, description, buttonText, menu }
      )
      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  //*PRO_
  /**
   * Send status text
   * @param text The text for the status
   */
  public async sendStatusText(text: string) {
    return new Promise(async (resolve, reject) => {
      const typeFunction = 'sendText'
      const type = 'string'
      const check = [
        {
          param: 'text',
          type: type,
          value: text,
          function: typeFunction,
          isUser: true,
        },
      ]
      const validating = checkValuesSender(check)
      if (typeof validating === 'object') {
        return reject(validating)
      }
      const to = 'status@broadcast'
      const result = await this.page.evaluate(
        ({ to, text }) => {
          return WAPI.sendMessage(to, text, true)
        },
        { to, text }
      )

      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * Create poll
   * @param idUser chat id: xxxxx@us.c
   */
  public async sendPollCreation(idUser: string, poll: any) {
    return new Promise(async (resolve, reject) => {
      const result = await this.page.evaluate(
        ({ idUser, poll }) => {
          return WAPI.sendPollCreation(idUser, poll)
        },
        { idUser, poll }
      )
      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  //*PRO_
  /**
   * @param filePath path, http link or base64Encoded
   * @param filename
   */
  public async sendImageStatus(
    filePath: string,
    description?: string
  ): Promise<SendFileResult> {
    return new Promise(async (resolve, reject) => {
      const base64 = await base64Management.getBase64(filePath, [
        'image/gif',
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/webp',
      ])

      if (base64.error) {
        return reject(base64.error)
      }

      let filename = path.basename(filePath)

      if (!base64.mimeType.includes('image')) {
        const obj = {
          erro: true,
          to: 'status',
          text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp',
        }
        return reject(obj)
      }
      const to = 'status@broadcast'
      filename = filenameFromMimeType(filename, base64.mimeType)

      const base64Data = base64.data
      const result = await this.page.evaluate(
        ({ to, base64Data, filename, description }) => {
          return WAPI.sendImage(
            base64Data,
            to,
            filename,
            description,
            'sendImageStatus'
          )
        },
        { to, base64Data, filename, description }
      )

      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * Sends file from path
   * @param filePath File path
   * @param caption
   */
  public async sendVideoStatus(filePath: string, description?: string) {
    return new Promise(async (resolve, reject) => {
      const base64 = await base64Management.getBase64(filePath, ['video/mp4'])
      let obj: { erro: boolean; to: string; text: string }

      if (base64.error) {
        return reject(base64.error)
      }

      let filename = path.basename(filePath)

      if (!base64.mimeType) {
        obj = {
          erro: true,
          to: 'status',
          text: 'Invalid base64!',
        }
        return reject(obj)
      }

      if (!base64.mimeType.includes('video')) {
        const obj = {
          erro: true,
          to: 'status',
          text: 'Not an video, allowed format mp4',
        }
        return reject(obj)
      }

      filename = filenameFromMimeType(filename, base64.mimeType)
      const to = 'status@broadcast'
      const base64Data = base64.data
      const result = await this.page.evaluate(
        ({ to, base64Data, filename, description }) => {
          return WAPI.sendFile(
            base64Data,
            to,
            filename,
            description,
            'sendVideoStatus',
            true
          )
        },
        { to, base64Data, filename, description }
      )
      if (result['erro'] == true) {
        reject(result)
      } else {
        resolve(result)
      }
    })
  }

  /**
   * Sends a text message to given chat
   * @param to chat id: xxxxx@us.c
   * @param content text message
   * @param idMessage add id message
   * @param passId new id
   */
  public async sendButtons(
    to: string,
    title: string,
    subtitle: string,
    buttons: any
  ): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      const typeFunction = 'sendButtons'
      const type = 'string'
      const obj = 'object'
      const check = [
        {
          param: 'to',
          type: type,
          value: to,
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
        {
          param: 'subtitle',
          type: type,
          value: subtitle,
          function: typeFunction,
          isUser: true,
        },
        {
          param: 'buttons',
          type: obj,
          value: buttons,
          function: typeFunction,
          isUser: true,
        },
      ]
      const validating = checkValuesSender(check)
      if (typeof validating === 'object') {
        return reject(validating)
      }

      const result = await this.page.evaluate(
        ({ to, title, subtitle, buttons }) => {
          return WAPI.sendButtons(to, title, buttons, subtitle)
        },
        { to, title, subtitle, buttons }
      )
      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  public async sendTypeButtons(
    to: string,
    title: string,
    subtitle: string,
    footer: string,
    buttons: any
  ): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      const result = await this.page.evaluate(
        ({ to, title, subtitle, footer, buttons }) => {
          return WAPI.sendTypeButtons(to, title, subtitle, footer, buttons)
        },
        { to, title, subtitle, footer, buttons }
      )
      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * Sends a text message to given chat
   * @param to chat id: xxxxx@us.c
   * @param content text message
   * @param passId new id
   * @param checkNumber the number when submitting!
   * @param forcingReturn return without sending the message to the server!
   */
  public async sendText(
    to: string,
    content: string,
    passId?: any,
    checkNumber?: boolean,
    forcingReturn?: boolean,
    delSend?: boolean
  ): Promise<Object> {
    const typeFunction = 'sendText'
    const type = 'string'
    const check = [
      {
        param: 'to',
        type: type,
        value: to,
        function: typeFunction,
        isUser: true,
      },
      {
        param: 'content',
        type: type,
        value: content,
        function: typeFunction,
        isUser: true,
      },
    ]

    const validating = checkValuesSender(check)
    if (typeof validating === 'object') {
      throw validating
    }

    return this.processBrowserFunction(
      '[SenderLayer.sendText]',
      {
        to,
        content,
        passId,
        checkNumber,
        forcingReturn,
        delSend,
      },
      ({ to, content, passId, checkNumber, forcingReturn, delSend }) => {
        return WAPI.sendMessage(
          to,
          content,
          undefined,
          passId,
          checkNumber,
          forcingReturn,
          delSend
        )
      }
    )
  }

  /**
   * Automatically sends a link with the auto generated link preview. You can also add a custom message to be added.
   * @param chatId chat id: xxxxx@us.c
   * @param url string A link, for example for youtube. e.g https://www.youtube.com/watch?v=Zi_XLOBDo_Y&list=RDEMe12_MlgO8mGFdeeftZ2nOQ&start_radio=1
   * @param title custom text as the message body, this includes the link or will be attached after the link
   */
  public async sendLinkPreview(
    chatId: string,
    url: string,
    title: string,
    message: string
  ): Promise<object> {
    return new Promise(async (resolve, reject) => {
      const typeFunction = 'sendLinkPreview'
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
          param: 'url',
          type: type,
          value: url,
          function: typeFunction,
          isUser: true,
        },
        {
          param: 'title',
          type: type,
          value: title,
          function: typeFunction,
          isUser: false,
        },
        {
          param: 'message',
          type: type,
          value: message,
          function: typeFunction,
          isUser: false,
        },
      ]
      const validating = checkValuesSender(check)
      if (typeof validating === 'object') {
        return reject(validating)
      }
      const thumbnail = await dowloadMetaFileBase64(url)
      const result = await this.page.evaluate(
        ({ chatId, url, title, message, thumbnail }) => {
          return WAPI.sendLinkPreview(chatId, url, title, message, thumbnail)
        },
        { chatId, url, title, message, thumbnail }
      )
      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * Sends image message base64
   * @param to Chat id
   * @param base64 File path, http link or base64Encoded
   * @param filename
   * @param caption
   */
  public async sendImageFromBase64(
    to: string,
    base64: string,
    filename?: string,
    caption?: string,
    status?: boolean
  ): Promise<SendFileResult> {
    return new Promise(async (resolve, reject) => {
      const typeFunction = 'sendImageFromBase64'
      const type = 'string'
      const check = [
        {
          param: 'to',
          type: type,
          value: to,
          function: typeFunction,
          isUser: true,
        },
        {
          param: 'base64',
          type: type,
          value: base64,
          function: typeFunction,
          isUser: true,
        },
        {
          param: 'filename',
          type: type,
          value: filename,
          function: typeFunction,
          isUser: false,
        },
      ]

      const validating = checkValuesSender(check)
      if (typeof validating === 'object') {
        return reject(validating)
      }

      const mimeType = base64Management.getBase64MimeType(base64)

      if (!mimeType) {
        const obj = {
          erro: true,
          to: to,
          text: 'Invalid base64!',
        }
        return reject(obj)
      }

      if (!mimeType.includes('image')) {
        const obj = {
          erro: true,
          to: to,
          text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp',
        }
        return reject(obj)
      }

      filename = filenameFromMimeType(filename, mimeType)

      const result = await this.page.evaluate(
        ({ to, base64, filename, caption, status }) => {
          return WAPI.sendImage(base64, to, filename, caption, status)
        },
        { to, base64, filename, caption, status }
      )

      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * only admin send messages
   * @param chatId Group
   * @param {boolean} type 'true' only admin can send messages or 'false' everyone can send
   */
  public async onlySendAdmin(chatId: string, type: boolean) {
    return new Promise(async (resolve, reject) => {
      const result: any = await this.page
        .evaluate(
          ({ chatId, type }) => {
            return WAPI.onlySendAdmin(chatId, type)
          },
          { chatId, type }
        )
        .catch(() => {})
      if (result?.erro == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  public async sendMessageOptions(
    chat: any,
    content: any,
    options?: any
  ): Promise<Message> {
    return new Promise(async (resolve, reject) => {
      try {
        const messageId = await this.page.evaluate(
          ({ chat, content, options }) => {
            return WAPI.sendMessageOptions(chat, content, options)
          },
          { chat, content, options }
        )
        const result = (await this.page.evaluate(
          (messageId: any) => WAPI.getMessageById(messageId),
          messageId
        )) as Message
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Sends image message
   * @param to Chat id
   * @param filePath File path or http link
   * @param filename
   * @param caption
   */
  public async sendImage(
    to: string,
    filePath: string,
    filename?: string,
    caption?: string,
    passId?: any
  ): Promise<SendFileResult> {
    const base64 = await base64Management.getBase64(filePath, [
      'image/gif',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp',
    ])

    if (base64.error) {
      throw base64.error
    }

    if (!filename) {
      filename = path.basename(filePath)
    }

    if (!base64.mimeType) {
      const obj = {
        erro: true,
        to: to,
        text: 'Invalid base64!',
      }
      throw obj
    }

    if (!base64.mimeType.includes('image')) {
      const obj = {
        erro: true,
        to: to,
        text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp',
      }
      throw obj
    }

    filename = filenameFromMimeType(filename, base64.mimeType)

    return this.processBrowserFunction(
      `[SenderLayer.sendImage]`,
      { to, base64Data: base64.data, filename, caption, passId },
      ({ to, base64Data, filename, caption, passId }) => {
        return WAPI.sendImage(
          base64Data,
          to,
          filename,
          caption,
          'sendImage',
          false,
          passId
        )
      },
      10000 // 10 seconds timeout
    )
  }

  /**
   * Sends image from url
   * @param to Chat Id,
   * @param url file url path
   * @param filename
   * @param caption
   * @param passId if of new message
   */
  public async sendImageFromUrl(
    to: string,
    url: string,
    filename: string,
    caption: string,
    passId: any
  ) {
    const scope = '[SenderLayer.sendImageFromUrl]'
    const allowedMimeType = [
      'image/gif',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp',
    ]
    const type = 'sendImage'
    return await this.sendFileFromUrlGeneric(
      scope,
      to,
      url,
      caption,
      passId,
      filename,
      allowedMimeType,
      type
    )
  }

  /**
   * Sends image from socket
   * @param to chat id
   * @param url file url path
   * @param caption caption
   * @param passId if of new message
   */
  public async sendImageFromSocket(
    to: string,
    url: string,
    caption: string,
    passId: any
  ) {
    // TODO - Validações de mimeType
    const scope = '[SenderLayer.sendImageFromSocket]'
    return await this.sendEncryptedFile(
      scope,
      to,
      url,
      undefined,
      caption,
      'image',
      passId
    )
  }

  /**
   * Sends video from socket
   * @param to chat id
   * @param url file url path
   * @param caption caption
   * @param passId if of new message
   */
  public async sendVideoFromSocket(
    to: string,
    url: string,
    caption: string,
    passId: any
  ) {
    // TODO - Validações de mimeType
    const scope = '[SenderLayer.sendVideoFromSocket]'
    return await this.sendEncryptedFile(
      scope,
      to,
      url,
      undefined,
      caption,
      'video',
      passId
    )
  }

  /**
   * Sends voice from socket
   * @param to chat id
   * @param url file url path
   * @param filename file name
   * @param passId if of new message
   */
  public async sendVoiceFromSocket(
    to: string,
    url: string,
    filename: string,
    passId: any
  ) {
    // TODO - Validações de mimeType
    const scope = '[SenderLayer.sendVoiceFromSocket]'
    return await this.sendEncryptedFile(
      scope,
      to,
      url,
      filename,
      undefined,
      'audio',
      passId
    )
  }

  /**
   * Sends document from socket
   * @param to chat id
   * @param url file url path
   * @param filename file name
   * @param passId if of new message
   */
  public async sendDocumentFromSocket(
    to: string,
    url: string,
    filename: string,
    caption: string,
    passId: any
  ) {
    const scope = '[SenderLayer.sendDocumentFromSocket]'
    return await this.sendEncryptedFile(
      scope,
      to,
      url,
      filename,
      caption,
      'document',
      passId
    )
  }

  /**
   * Sends message with thumbnail
   * @param thumb
   * @param url
   * @param title
   * @param description
   * @param chatId
   */
  public async sendMessageWithThumb(
    thumb: string,
    url: string,
    title: string,
    description: string,
    chatId: string
  ) {
    return await this.page.evaluate(
      ({ thumb, url, title, description, chatId }) => {
        WAPI.sendMessageWithThumb(thumb, url, title, description, chatId)
      },
      {
        thumb,
        url,
        title,
        description,
        chatId,
      }
    )
  }

  /**
   * Replies to given mesage id of given chat id
   * @param to Chat id
   * @param content Message body
   * @param quotedMsg Message id to reply to.
   */
  public async reply(
    to: string,
    content: string,
    quotedMsg: string,
    passId?: any,
    checkNumber?: boolean,
    limitIterationFindMessage?: number,
    sendEvenIfNotExists?: boolean
  ): Promise<Message | object> {
    const typeFunction = 'reply'
    const type = 'string'
    const check = [
      {
        param: 'to',
        type: type,
        value: to,
        function: typeFunction,
        isUser: true,
      },
      {
        param: 'content',
        type: type,
        value: content,
        function: typeFunction,
        isUser: true,
      },
      {
        param: 'quotedMsg',
        type: type,
        value: quotedMsg,
        function: typeFunction,
        isUser: false,
      },
    ]

    const validating = checkValuesSender(check)
    if (typeof validating === 'object') {
      throw validating
    }

    return this.processBrowserFunction(
      '[SenderLayer.reply]',
      {
        to,
        content,
        quotedMsg,
        passId,
        checkNumber,
        limitIterationFindMessage,
        sendEvenIfNotExists,
      },
      ({
        to,
        content,
        quotedMsg,
        passId,
        checkNumber,
        limitIterationFindMessage,
        sendEvenIfNotExists,
      }) => {
        return WAPI.reply(
          to,
          content,
          quotedMsg,
          passId,
          checkNumber,
          limitIterationFindMessage,
          sendEvenIfNotExists
        )
      }
    )
  }

  /**
   * Send audio base64
   * @param to Chat id
   * @param base64 base64 data
   * @param passId new id
   */
  public async sendVoiceBase64(to: string, base64: string, passId?: any) {
    return new Promise(async (resolve, reject) => {
      const mimeType = base64Management.getBase64MimeType(base64)

      if (!mimeType) {
        const obj = {
          erro: true,
          to: to,
          text: 'Invalid base64!',
        }
        return reject(obj)
      }

      if (
        !mimeType ||
        mimeType.includes('audio/mpeg') ||
        mimeType.includes('audio/mp3')
      ) {
        const result = await this.page.evaluate(
          ({ to, base64, passId }) => {
            return WAPI.sendPtt(base64, to, passId)
          },
          { to, base64, passId }
        )
        if (result['erro'] == true) {
          reject(result)
        } else {
          resolve(result)
        }
      } else {
        const obj = {
          erro: true,
          to: to,
          text: 'Use the MP3 format to be able to send an audio!',
        }
        return reject(obj)
      }
    })
  }

  /**
   * Send audio file
   * @param to Chat id
   * @param filePath Path file
   * @param passId new id
   * @param checkNumber the number when submitting!
   * @param forcingReturn return without sending the message to the server!
   */
  public async sendVoice(
    to: string,
    filePath: string,
    passId?: any,
    checkNumber?: boolean,
    forcingReturn?: boolean,
    delSend?: boolean
  ) {
    const base64 = await base64Management.getBase64(filePath, [
      'audio/mpeg',
      'audio/mp3',
      'audio/aac',
      'audio/flac',
      'audio/vnd.dlna.adts',
      'audio/ogg',
      'audio/wav',
    ])

    if (base64.error) {
      throw base64.error
    }

    return this.processBrowserFunction(
      `[SenderLayer.sendVoice]`,
      {
        to,
        base64Data: base64.data,
        passId,
        checkNumber,
        forcingReturn,
        delSend,
      },
      ({ to, base64Data, passId, checkNumber, forcingReturn, delSend }) => {
        return WAPI.sendPtt(
          base64Data,
          to,
          passId,
          checkNumber,
          forcingReturn,
          delSend
        )
      },
      20000 // 20 seconds timeout
    )
  }

  /**
   * Sends voice from url
   * @param to Chat Id,
   * @param url file url path
   * @param filename
   * @param caption
   * @param passId if of new message
   */
  public async sendVoiceFromUrl(
    to: string,
    url: string,
    filename: string,
    caption: string,
    passId: any
  ) {
    const scope = '[SenderLayer.sendVoiceFromUrl]'
    const allowedMimeType = [
      'audio/mpeg',
      'audio/mp3',
      'audio/aac',
      'audio/flac',
      'audio/vnd.dlna.adts',
      'audio/ogg',
      'audio/wav',
    ]
    const type = 'sendPtt'
    return await this.sendFileFromUrlGeneric(
      scope,
      to,
      url,
      caption,
      passId,
      filename,
      allowedMimeType,
      type
    )
  }

  /**
   * Sends file
   * base64 parameter should have mime type already defined
   * @param to Chat id
   * @param base64 base64 data
   * @param filename
   * @param caption
   */
  public async sendFileFromBase64(
    to: string,
    base64: string,
    filename: string,
    caption?: string,
    passId?: any
  ): Promise<SendFileResult> {
    return new Promise(async (resolve, reject) => {
      const mimeType = base64Management.getBase64MimeType(base64)

      if (!mimeType) {
        const obj = {
          erro: true,
          to: to,
          text: 'Invalid base64!',
        }
        return reject(obj)
      }

      const type = 'FileFromBase64'
      const result = await this.page.evaluate(
        ({ to, base64, filename, caption, type, passId }) => {
          return WAPI.sendFile(
            base64,
            to,
            filename,
            caption,
            type,
            undefined,
            passId
          )
        },
        { to, base64, filename, caption, type, passId }
      )
      if (result['erro'] == true) {
        reject(result)
      } else {
        resolve(result)
      }
    })
  }

  /**
   * Sends file from path
   * @param to Chat id
   * @param filePath File path
   * @param filename
   * @param caption
   */
  public async sendFile(
    to: string,
    filePath: string,
    filename?: string,
    caption?: string,
    passId?: any,
    checkNumber?: boolean,
    forcingReturn?: boolean,
    delSend?: boolean
  ) {
    const base64 = await base64Management.getBase64(filePath)
    if (base64.error) {
      throw base64.error
    }

    if (!filename && typeof filename !== 'string') {
      filename = path.basename(filePath)
    }

    if (!base64.mimeType) {
      const obj: Scope = {
        erro: true,
        to: to,
        text: 'Invalid base64!',
      }
      throw obj
    }

    return this.processBrowserFunction(
      '[SenderLayer.sendFile]',
      {
        to,
        base64Data: base64.data,
        filename,
        caption,
        passId,
        checkNumber,
        forcingReturn,
        delSend,
      },
      ({
        to,
        base64Data,
        filename,
        caption,
        passId,
        checkNumber,
        forcingReturn,
        delSend,
      }) => {
        return WAPI.sendFile(
          base64Data,
          to,
          filename,
          caption,
          'sendFile',
          undefined,
          passId,
          checkNumber,
          forcingReturn,
          delSend
        )
      },
      20000 // 20 seconds timeout
    )
  }

  /**
   * Sends file from url
   * @param to Chat Id,
   * @param url file url path
   * @param filename
   * @param caption
   * @param passId if of new message
   */
  public async sendFileFromUrl(
    to: string,
    url: string,
    filename: string,
    caption: string,
    passId: any
  ) {
    const scope = '[SenderLayer.sendFileFromFromUrl]'
    return await this.sendFileFromUrlGeneric(
      scope,
      to,
      url,
      caption,
      passId,
      filename
    )
  }

  /**
   * Sends file from path
   * @param to Chat id
   * @param path File path
   * @param filename
   * @param caption
   */
  public async sendVideoAsGif(
    to: string,
    path: string,
    filename: string,
    caption: string
  ) {
    const base64 = await base64Management.getBase64(path)
    if (base64.error) {
      throw new Error(base64.error.text)
    }
    const base64Data = base64.data
    return await this.page.evaluate(
      ({ to, base64Data, filename, caption }) => {
        WAPI.sendVideoAsGif(base64Data, to, filename, caption)
      },
      { to, base64Data, filename, caption }
    )
  }

  /**
   * Sends contact card to iven chat id
   * @param to Chat id
   * @param contactsId Example: 0000@c.us | [000@c.us, 1111@c.us]
   */
  public async sendContactVcard(
    to: string,
    contactsId: string | string[],
    name?: string
  ) {
    return new Promise(async (resolve, reject) => {
      const result = await this.page.evaluate(
        ({ to, contactsId, name }) => {
          return WAPI.sendContactVcard(to, contactsId, name)
        },
        { to, contactsId, name }
      )
      if (result['erro'] == true) {
        reject(result)
      } else {
        resolve(result)
      }
    })
  }

  /**
   * Send a list of contact cards
   * @param to Chat id
   * @param contacts Example: | [000@c.us, 1111@c.us]
   */
  public async sendContactVcardList(to: string, contacts: string[]) {
    return new Promise(async (resolve, reject) => {
      const result = await this.page.evaluate(
        ({ to, contacts }) => {
          return WAPI.sendContactVcardList(to, contacts)
        },
        { to, contacts }
      )
      if (result['erro'] == true) {
        reject(result)
      } else {
        resolve(result)
      }
    })
  }

  /**
   * Forwards array of messages (could be ids or message objects)
   * @param to Chat id
   * @param messages Array of messages ids to be forwarded
   * @param skipMyMessages Ignore messages from yourself
   * @param limitIterationFindMessage If messages not loaded, set the limit of iterate the search. Default is 1. If 0, ulimited
   */
  public async forwardMessages(
    to: string,
    messages: string | string[],
    skipMyMessages: boolean,
    limitIterationFindMessage: number
  ) {
    return this.processBrowserFunction(
      `[SenderLayer.forwardMessages]`,
      { to, messages, skipMyMessages, limitIterationFindMessage },
      ({ to, messages, skipMyMessages, limitIterationFindMessage }) => {
        return WAPI.forwardMessages(
          to,
          messages,
          skipMyMessages,
          limitIterationFindMessage
        ).catch((e) => e)
      }
    )
  }

  /**
   * Generates sticker from the provided animated gif image and sends it (Send image as animated sticker)
   *  @param path image path imageBase64 A valid gif image is required. You can also send via http/https (http://www.website.com/img.gif)
   *  @param to chatId '000000000000@c.us'
   */
  public async sendImageAsStickerGif(
    to: string,
    path: string
  ): Promise<SendStickerResult> {
    const base64 = await base64Management.getBase64(path, [
      'image/gif',
      'image/webp',
    ])

    const buff = Buffer.from(
      base64.data.replace(/^data:image\/(gif|webp);base64,/, ''),
      'base64'
    )
    if (!base64.mimeType || base64.mimeType.includes('image')) {
      const obj = await stickerSelect(buff, 1)
      if (typeof obj == 'object') {
        const _webb64 = obj['webpBase64']
        const _met = obj['metadata']

        return new Promise(async (resolve, reject) => {
          const result = await this.page.evaluate(
            ({ _webb64, to, _met }) => {
              return WAPI.sendImageAsSticker(_webb64, to, _met, 'StickerGif')
            },
            { _webb64, to, _met }
          )
          if (result['erro'] == true) {
            reject(result)
          } else {
            resolve(result)
          }
        })
      } else {
        throw {
          error: true,
          message: 'Error with sharp library, check the console log',
        }
      }
    }
  }

  /**
   * Generates sticker from given image and sends it (Send Image As Sticker)
   * @param path image path imageBase64 A valid png, jpg and webp image is required. You can also send via http/https (http://www.website.com/img.gif)
   * @param to chatId '000000000000@c.us'
   */
  public async sendImageAsSticker(
    to: string,
    path: string
  ): Promise<SendStickerResult> {
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
      base64.data.replace(/^data:image\/(png|jpe?g|webp|gif);base64,/, ''),
      'base64'
    )

    if (!base64.mimeType || base64.mimeType.includes('image')) {
      const obj = await stickerSelect(buff, 0)
      if (typeof obj == 'object') {
        const _webb64 = obj['webpBase64']
        const _met = obj['metadata']
        return new Promise(async (resolve, reject) => {
          const result = await this.page.evaluate(
            ({ _webb64, to, _met }) => {
              return WAPI.sendImageAsSticker(_webb64, to, _met, 'Sticker')
            },
            { _webb64, to, _met }
          )
          if (result['erro'] == true) {
            reject(result)
          } else {
            resolve(result)
          }
        })
      } else {
        throw {
          error: true,
          message: 'Error with sharp library, check the console log',
        }
      }
    } else {
      logger.error('Not an image, allowed formats png, jpeg and webp')
      throw new Error(BASE64_ERROR.CONTENT_TYPE_NOT_ALLOWED)
    }
  }

  /**
   * TODO: Fix message not being delivered
   * Sends location to given chat id
   * @param to Chat id
   * @param latitude Latitude
   * @param longitude Longitude
   * @param title Text caption
   */
  public async sendLocation(
    to: string,
    latitude: string,
    longitude: string,
    title: string
  ) {
    return new Promise(async (resolve, reject) => {
      const result = await this.page.evaluate(
        ({ to, latitude, longitude, title }) => {
          return WAPI.sendLocation(to, latitude, longitude, title)
        },
        { to, latitude, longitude, title }
      )
      if (result['erro'] == true) {
        reject(result)
      } else {
        resolve(result)
      }
    })
  }

  /**
   * Starts typing ('Typing...' state)
   * @param chatId chat id: xxxxx@us.c
   * @param checkNumber the number when submitting!
   */
  public async startTyping(chatId: string, checkNumber: boolean) {
    return new Promise(async (resolve, reject) => {
      const typeFunction = 'startTyping'
      const type = 'string'
      const check = [
        {
          param: 'chatId',
          type: type,
          value: chatId,
          function: typeFunction,
          isUser: true,
        },
      ]
      const validating = checkValuesSender(check)
      if (typeof validating === 'object') {
        return reject(validating)
      }
      const result = await this.page.evaluate(
        ({ chatId, checkNumber }) => WAPI.startTyping(chatId, checkNumber),
        { chatId, checkNumber }
      )

      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * Start Recording
   * @param chatId Chat id
   * @param checkNumber the number when submitting!
   */
  public async startRecording(chatId: string, checkNumber: boolean) {
    return new Promise(async (resolve, reject) => {
      const typeFunction = 'startRecording'
      const type = 'string'
      const check = [
        {
          param: 'chatId',
          type: type,
          value: chatId,
          function: typeFunction,
          isUser: true,
        },
      ]
      const validating = checkValuesSender(check)
      if (typeof validating === 'object') {
        return reject(validating)
      }
      const result = await this.page.evaluate(
        ({ chatId, checkNumber }) => WAPI.startRecording(chatId, checkNumber),
        { chatId, checkNumber }
      )

      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * Mark Paused
   * @param chatId Chat id
   * @param checkNumber the number when submitting!
   */
  public async markPaused(chatId: string, checkNumber: boolean) {
    return new Promise(async (resolve, reject) => {
      const typeFunction = 'startRecording'
      const type = 'string'
      const check = [
        {
          param: 'chatId',
          type: type,
          value: chatId,
          function: typeFunction,
          isUser: true,
        },
      ]
      const validating = checkValuesSender(check)
      if (typeof validating === 'object') {
        return reject(validating)
      }
      const result = await this.page.evaluate(
        ({ chatId, checkNumber }) => WAPI.markPaused(chatId, checkNumber),
        { chatId, checkNumber }
      )

      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * Clear Presence
   * @param chatId Chat id
   */
  public async clearPresence(chatId: string) {
    return new Promise(async (resolve, reject) => {
      const typeFunction = 'clearPresence'
      const type = 'string'
      const check = [
        {
          param: 'chatId',
          type: type,
          value: chatId,
          function: typeFunction,
          isUser: true,
        },
      ]
      const validating = checkValuesSender(check)
      if (typeof validating === 'object') {
        return reject(validating)
      }

      const result = await this.page.evaluate(
        ({ chatId }) => WAPI.clearPresence(chatId),
        { chatId }
      )

      if (result['erro'] == true) {
        return reject(result)
      } else {
        return resolve(result)
      }
    })
  }

  /**
   * Presence Available
   */
  public async presenceAvailable() {
    return this.page.evaluate(() => WAPI.presenceAvailable())
  }

  /**
   * Presence Available
   */
  public async presenceUnavailable() {
    return this.page.evaluate(() => WAPI.presenceUnavailable())
  }

  /**
   * Sends text with tags
   *
   */
  public async sendMentioned(to: string, message: string, mentioned: string[]) {
    return await this.page.evaluate(
      ({ to, message, mentioned }) => {
        WAPI.sendMessageMentioned(to, message, mentioned)
      },
      { to, message, mentioned }
    )
  }

  /**
   * Sets the chat state
   * @param chatState
   * @param chatId
   */
  public async setChatState(chatId: string, chatState: ChatState) {
    return await this.page.evaluate(
      ({ chatState, chatId }) => {
        return WAPI.sendChatstate(chatState, chatId)
      },
      { chatState, chatId }
    )
  }

  public async sendReactions(IdMessage: string, emoji: string) {
    return await this.page.evaluate(
      ({ IdMessage, emoji }) => {
        WAPI.sendReactions(IdMessage, emoji)
      },
      { IdMessage, emoji }
    )
  }

  private async sendFileFromUrlGeneric(
    scope: string,
    to: string,
    url: string,
    caption: string,
    passId: any,
    filename: string,
    allowedMimeType?: string[],
    type?: string
  ) {
    return this.processBrowserFunction(
      scope,
      {
        to,
        url,
        caption,
        passId,
        filename,
        allowedMimeType,
        type,
      },
      ({ to, url, caption, passId, filename, allowedMimeType, type }) => {
        return WAPI.sendFileFromUrl(
          to,
          url,
          caption,
          passId,
          filename,
          allowedMimeType,
          type
        )
      },
      40000 // 40 seconds timeout
    )
  }

  private async processBrowserFunction(
    scope: string,
    payload: any,
    waitForFunction: (...args) => Promise<any>,
    timeout: number = 5000
  ) {
    try {
      const functionResult = await this.page.waitForFunction(
        waitForFunction,
        { timeout },
        payload
      )

      const result = await functionResult.jsonValue()

      if (result['erro'] == true) {
        throw result
      }

      return result
    } catch (error) {
      logger.error(`${scope} message=${error.message} error=${error.stack}`)

      const errorTextList = [error.message, error.text, error.stack]
      const isProtocolTimeoutError = errorTextList.some((errorText) =>
        errorText?.includes('protocolTimeout')
      )
      // const isTargetClosedError = errorTextList.some((errorText) =>
      //   errorText?.includes('TargetCloseError')
      // )
      // const isTimeoutError = errorTextList.some((errorText) =>
      //   errorText?.includes('TimeoutError')
      // )

      // if (isTargetClosedError) {
      //   logger.error(`${scope} target closed`)
      // }
      if (isProtocolTimeoutError) {
        await this.page.reload()
      }

      throw error
    }
  }

  async sendEncryptedFile(
    scope: string,
    chatId: string,
    url: string,
    filename: string,
    caption: string,
    mediaType: keyof typeof MEDIA_PATH,
    passId: Object | undefined
  ) {
    // TODO - Validações de campos

    const preSendFileFromSocketResult = await this.processBrowserFunction(
      scope,
      {
        chatId,
        passId,
      },
      async ({ chatId, passId }) => {
        return WAPI.preSendFileFromSocket(chatId, passId)
      },
      2000 // 2 seconds timeout
    )
    const response = await axios.get(url, { responseType: 'stream' })
    const content = fileTypeChecker.getFileContent(response, mediaType)

    const fullMessage = await generateWAMessage(chatId, content, {
      logger,
      userJid: preSendFileFromSocketResult.instanceNumber,
      getUrlInfo: (text) =>
        getUrlInfo(text, {
          thumbnailWidth: 192,
          fetchOpts: {
            timeout: 3_000,
          },
          logger,
          uploadImage: this.uploadToWpp(),
        }),
      upload: this.uploadToWpp(),
      messageId: preSendFileFromSocketResult.newMessageId,
    })

    const payload = {
      message: this.prepareMessage(scope, {
        fullMessage,
        caption,
        filename,
        mediaType,
        content,
      }),
      chatId,
      passId,
    }

    return this.processBrowserFunction(
      scope,
      payload,
      (payload) => {
        return WAPI.sendFileFromMessage(
          payload.message,
          payload.chatId,
          payload.passId
        )
      },
      1000 // 1 seconds timeout
    )
  }

  private prepareMessage(
    scope: string,
    { fullMessage, caption, filename, mediaType, content }
  ) {
    const key = getContentType(fullMessage.message)

    const generatedMessage = fullMessage.message[key]

    const result = {
      // id: newMessageId,
      // from: fromwWid,
      // to: chat.id,
      ack: 0,
      local: true,
      self: 'out',
      t: Math.floor(Date.now() / 1000),
      isNewMsg: true,
      invis: true,
      type: mediaType,
      deprecatedMms3Url: generatedMessage.url,
      directPath: generatedMessage.directPath,
      encFilehash: this.bufferToBase64(generatedMessage.fileEncSha256),
      filehash: this.bufferToBase64(generatedMessage.fileSha256),
      mediaKeyTimestamp: parseInt(generatedMessage.mediaKeyTimestamp),
      mimetype: generatedMessage.mimetype,
      ephemeralStartTimestamp: parseInt(generatedMessage.mediaKeyTimestamp),
      mediaKey: this.bufferToBase64(generatedMessage.mediaKey),
      size: parseInt(generatedMessage.fileLength),
      url: generatedMessage.url,
      staticUrl: generatedMessage.url,

      caption: undefined,
      filename: undefined,
      preview: undefined,
      height: undefined,
      width: undefined,
      waveform: undefined,
      duration: undefined,
    }

    switch (mediaType) {
      case MEDIA_PATH.image:
      case MEDIA_PATH.video:
        result.caption = caption
        result.preview = this.bufferToBase64(generatedMessage.jpegThumbnail)
        result.height = generatedMessage.height
        result.width = generatedMessage.width
        break
      case MEDIA_PATH.audio:
        result.filename = filename
        result.duration = generatedMessage.seconds
        result.waveform = generatedMessage.waveform
        result.type = fileTypeChecker.normalizeAudioType(content.ptt)
        break
      case MEDIA_PATH.document:
        result.filename = filename
        result.caption = caption
        break
      default:
        logger.error(
          `${scope} mediaType not allowed: ${mediaType}. Message: ${JSON.stringify(
            fullMessage
          )}`
        )
        // TODO - Throw aqui ou solução melhor
        break
    }

    return result
  }

  private bufferToBase64(buffer: Buffer): string {
    return btoa(String.fromCharCode.apply(null, buffer))
  }

  private uploadToWpp = (): WAMediaUploadFunction => {
    return async (stream, { mediaType, fileEncSha256B64, timeoutMs }) => {
      let uploadInfo = await this.getMediaConn(false)

      let urls: { mediaUrl: string; directPath: string } | undefined

      fileEncSha256B64 = encodeBase64EncodedStringForUpload(fileEncSha256B64)

      for (const { hostname } of uploadInfo.hosts) {
        logger.debug(`uploading to "${hostname}"`)

        const auth = encodeURIComponent(uploadInfo.auth)
        const url = `https://${hostname}${MEDIA_PATH_MAP[mediaType]}/${fileEncSha256B64}?auth=${auth}&token=${fileEncSha256B64}`
        let result: any
        try {
          const body = await axios.post(url, stream, {
            headers: {
              'Content-Type': 'application/octet-stream',
              Origin: 'https://web.whatsapp.com',
            },
            timeout: timeoutMs,
            responseType: 'json',
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          })
          result = body.data

          if (result?.url || result?.directPath) {
            urls = {
              mediaUrl: result.url,
              directPath: result.direct_path,
            }
            break
          } else {
            uploadInfo = await this.getMediaConn(true)
            throw new Error(`upload failed, reason: ${JSON.stringify(result)}`)
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            result = error.response?.data
          }

          const isLast =
            hostname === uploadInfo.hosts[uploadInfo.hosts.length - 1]?.hostname
          logger.warn(
            { trace: error.stack, uploadResult: result },
            `Error in uploading to ${hostname} ${isLast ? '' : ', retrying...'}`
          )
        }
      }

      if (!urls) {
        throw new Error('Media upload failed on all hosts')
      }

      return urls
    }
  }
}
