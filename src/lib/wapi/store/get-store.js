import { createMsgProtobufInject } from './create-msg-protobuf.inject'
import { mediaTypeFromProtobufInject } from './media-type-from-protobuf.inject'
import { typeAttributeFromProtobufInject } from './type-attribute-from-protobuf.inject'
import { createFanoutMsgStanzaInject } from './create-fanout-msg-stanza.inject'
import { customImportNamespace } from './custom-import-namespace'

function injectToFunctions() {
  const injectToFunctionMapping = [
    {
      id: 'createMsgProtobuf',
      module: 'WAWebE2EProtoGenerator',
      newFunction: createMsgProtobufInject,
    },
    {
      id: 'mediaTypeFromProtobuf',
      module: 'WAWebBackendJobsCommon',
      newFunction: mediaTypeFromProtobufInject,
    },
    {
      id: 'typeAttributeFromProtobuf',
      module: 'WAWebE2EProtoUtils',
      newFunction: typeAttributeFromProtobufInject,
    },
    {
      id: 'createFanoutMsgStanza',
      module: 'WAWebSendMsgCreateFanoutStanza',
      newFunction: createFanoutMsgStanzaInject,
    },
  ]

  injectToFunctionMapping.forEach((inject) => {
    window[inject.id] = customImportNamespace(inject.module)
    const module = window[inject.id]
    if (!module) {
      console.error(`Module ${inject.module} not found`)
      return
    }
    const oldFunction = module[inject.id]
    module[inject.id] = (...args) => inject.newFunction(oldFunction, args)
  })
}

export async function getStore() {
  window.Store.UserConstructor = customImportNamespace('WAWebWid')?.default
  window.Store.WidFactory = customImportNamespace('WAWebWidFactory')
  window.Store.ChatLoadMessages = customImportNamespace('WAWebChatLoadMessages')
  window.Store.MsgKey = customImportNamespace('WAWebMsgKey')?.default
  window.Store.Cmd = customImportNamespace('WAWebCmd')?.Cmd
  window.Store.Cmd = customImportNamespace('WAWebCmd')
  window.Store.Websocket = customImportNamespace('WASmaxJsx')
  window.Store.Wap = customImportNamespace('WAWap')
  window.Store.State = customImportNamespace('WAWebSocketModel')
  window.Store.Theme = customImportNamespace('WAWebUserPrefsGeneral')
  window.Store.Stream = customImportNamespace('WAWebStreamModel')?.Stream
  window.Store.MaybeMeUser = customImportNamespace('WAWebUserPrefsMeUser')
  window.Store.UploadUtils =
    customImportNamespace('WAWebUploadManager')?.default
  window.Store.genId = customImportNamespace(
    'WAWebFeatureDetectionRedirectIfMissingCapabilities'
  )
  window.Store.SendSocket = customImportNamespace('WADeprecatedSendIq')
  window.Store.Jid = customImportNamespace('WAWapJid')
  window.Store.Validators = customImportNamespace('WALinkify')
  window.Store.Contacts = customImportNamespace('WAWebContactCollection')
  window.Store.userJidToUserWid = customImportNamespace('WAWebJidToWid')
  window.Store.MyStatus = customImportNamespace('WAWebStatusContactAction')
  window.Store.PresenceCollection = customImportNamespace(
    'WAWebPresenceCollection'
  )?.default
  window.Store.Profile = customImportNamespace(
    'WAWebContactProfilePicThumbBridge'
  )
  window.Store.Login = customImportNamespace('WAWebCompanionRegUtils')
  window.Store.CheckWid = customImportNamespace('WAWebWidValidator')
  window.Store.Parser = customImportNamespace('WAWebE2EProtoUtils')?.default
  window.Store.Archive = customImportNamespace('WAWebChatDbUpdatesApi')
  window.Store.ChatUtil = customImportNamespace('WAWebChatClearBridge')
  window.Store.SendMute = customImportNamespace('WAWebChatMuteBridge')
  window.Store.BlockList = customImportNamespace('WAWebBlocklistCollection')
  window.Store.ChatStates = customImportNamespace('WAWebChatStateBridge')
  window.Store.Presence = customImportNamespace('WAWebContactPresenceBridge')
  window.Store.SetStatusChat = customImportNamespace('WAWebPresenceChatAction')
  window.Store.ReadSeen = customImportNamespace('WAWebUpdateUnreadChatAction')
  window.Store.blob = customImportNamespace('WAWebMediaOpaqueData')
  window.Store.MediaProcess = customImportNamespace('WAWebImageUtils')
  window.Store.MediaObject = customImportNamespace('WAWebMediaStorage')
  window.Store.addAndSendMsgToChat = customImportNamespace(
    'WAWebSendMsgChatAction'
  )?.addAndSendMsgToChat
  window.Store.createNewsletterQuery = customImportNamespace(
    'WAWebNewsletterCreateQueryJob'
  )
  window.Store.SendTextMsgToChat = customImportNamespace(
    'WAWebSendTextMsgChatAction'
  )?.sendTextMsgToChat
  window.Store.createTextMsgData = customImportNamespace(
    'WAWebSendTextMsgChatAction'
  )?.createTextMsgData
  window.Store.Sticker = customImportNamespace('WAWebStickerCollection')
  window.Store.Block = customImportNamespace('WAWebBlockContactAction')
  window.Store.ButtonCollection = customImportNamespace(
    'WAWebButtonCollection'
  )?.ButtonCollection
  window.Store.TemplateButtonCollection = customImportNamespace(
    'WAWebTemplateButtonCollection'
  )?.TemplateButtonCollection
  window.Store.module = customImportNamespace('WAWebCollections')?.default
  window.Store.ProfileBusiness = customImportNamespace(
    'WAWebBusinessProfileModel'
  )
  window.Store.sendDelete = customImportNamespace(
    'WAWebDeleteChatAction'
  )?.sendDelete
  window.Store.pinChat = customImportNamespace('WAWebSetPinChatAction')
  window.Store.Survey = customImportNamespace(
    'WAWebPollsSendPollCreationMsgAction'
  )
  window.Store.Reactions = customImportNamespace('WAWebSendReactionMsgAction')
  window.Store.MediaCollection = customImportNamespace(
    'WAWebAttachMediaCollection'
  )?.default
  window.Store.onlySendAdmin = customImportNamespace('WAWebGroupModifyInfoJob')
  window.Store.SendCommunity = customImportNamespace('WAWebGroupCommunityJob')
  window.Store.Wap = customImportNamespace('WAWebGroupCreateJob')

  Object.keys(window.Store.module).forEach((key) => {
    if (!['Chat'].includes(key)) {
      if (window.Store[key]) {
        window.Store[key + '_'] = window.Store.module[key]
      } else {
        window.Store[key] = window.Store.module[key]
      }
    }
  })

  window.Store.MediaCollection.prototype.processFiles =
    window.Store.MediaCollection.prototype.processFiles ||
    window.Store.MediaCollection.prototype.processAttachments

  injectToFunctions()
}
