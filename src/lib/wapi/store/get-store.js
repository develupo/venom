import { createMsgProtobufInject } from './create-msg-protobuf.inject'
import { mediaTypeFromProtobufInject } from './media-type-from-protobuf.inject'
import { typeAttributeFromProtobufInject } from './type-attribute-from-protobuf.inject'
import { createFanoutMsgStanzaInject } from './create-fanout-msg-stanza.inject'

// NOTE - Maybe this could be needed
/* function getModule(moduleName) {
  const module = window.__debug.modulesMap[moduleName]
  let result = {}
  if (module) {
    result = {
      default: module.defaultExport,
      factory: module.factory,
    }
    if (Object.keys(result.default).length === 0) {
      try {
        self.ErrorGuard.skipGuardGlobal(true)
        Object.assign(result, self.importNamespace(moduleName))
      } catch (error) {
        console.error('Error on importNamespace', error)
      }
    }
  }

  return result
} */

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
    window[inject.id] = self.importNamespace(inject.module)
    const module = window[inject.id]
    const oldFunction = module[inject.id]
    module[inject.id] = (...args) => inject.newFunction(oldFunction, args)
  })
}

export async function getStore() {
  window.Store.UserConstructor = self.importNamespace('WAWebWid').default
  window.Store.WidFactory = self.importNamespace('WAWebWidFactory')
  window.Store.ChatLoadMessages = self.importNamespace('WAWebChatLoadMessages')
  window.Store.MsgKey = self.importNamespace('WAWebMsgKey').default
  window.Store.Cmd = self.importNamespace('WAWebCmd').Cmd
  window.Store.Cmd = self.importNamespace('WAWebCmd')
  window.Store.Websocket = self.importNamespace('WASmaxJsx')
  window.Store.Wap = self.importNamespace('WAWap')
  window.Store.State = self.importNamespace('WAWebSocketModel')
  window.Store.Theme = self.importNamespace('WAWebUserPrefsGeneral')
  window.Store.Stream = self.importNamespace('WAWebStreamModel').Stream
  window.Store.MaybeMeUser = self.importNamespace('WAWebUserPrefsMeUser')
  window.Store.UploadUtils = self.importNamespace('WAWebUploadManager').default
  window.Store.genId = self.importNamespace(
    'WAWebFeatureDetectionRedirectIfMissingCapabilities'
  )
  window.Store.SendSocket = self.importNamespace('WADeprecatedSendIq')
  window.Store.Jid = self.importNamespace('WAWapJid')
  window.Store.Validators = self.importNamespace('WALinkify')
  window.Store.Contacts = self.importNamespace('WAWebContactCollection')
  window.Store.userJidToUserWid = self.importNamespace('WAWebJidToWid')
  window.Store.MyStatus = self.importNamespace('WAWebStatusContactAction')
  window.Store.PresenceCollection = self.importNamespace(
    'WAWebPresenceCollection'
  ).default
  window.Store.Profile = self.importNamespace(
    'WAWebContactProfilePicThumbBridge'
  )
  window.Store.Login = self.importNamespace('WAWebCompanionRegUtils')
  window.Store.CheckWid = self.importNamespace('WAWebWidValidator')
  window.Store.Parser = self.importNamespace('WAWebE2EProtoUtils').default
  window.Store.Archive = self.importNamespace('WAWebChatDbUpdatesApi')
  window.Store.ChatUtil = self.importNamespace('WAWebChatClearBridge')
  window.Store.SendMute = self.importNamespace('WAWebChatMuteBridge')
  window.Store.BlockList = self.importNamespace('WAWebBlocklistCollection')
  window.Store.ChatStates = self.importNamespace('WAWebChatStateBridge')
  window.Store.Presence = self.importNamespace('WAWebContactPresenceBridge')
  window.Store.SetStatusChat = self.importNamespace('WAWebPresenceChatAction')
  window.Store.ReadSeen = self.importNamespace('WAWebUpdateUnreadChatAction')
  window.Store.blob = self.importNamespace('WAWebMediaOpaqueData')
  window.Store.MediaProcess = self.importNamespace('WAWebImageUtils')
  window.Store.MediaObject = self.importNamespace('WAWebMediaStorage')
  window.Store.addAndSendMsgToChat = self.importNamespace(
    'WAWebSendMsgChatAction'
  ).addAndSendMsgToChat
  window.Store.createNewsletterQuery = self.importNamespace(
    'WAWebNewsletterCreateQueryJob'
  )
  window.Store.SendTextMsgToChat = self.importNamespace(
    'WAWebSendTextMsgChatAction'
  ).sendTextMsgToChat
  window.Store.createTextMsgData = self.importNamespace(
    'WAWebSendTextMsgChatAction'
  ).createTextMsgData
  window.Store.Sticker = self.importNamespace('WAWebStickerCollection')
  window.Store.Block = self.importNamespace('WAWebBlockContactAction')
  window.Store.ButtonCollection = self.importNamespace(
    'WAWebButtonCollection'
  ).ButtonCollection
  window.Store.TemplateButtonCollection = self.importNamespace(
    'WAWebTemplateButtonCollection'
  ).TemplateButtonCollection
  window.Store.module = self.importNamespace('WAWebCollections').default
  window.Store.ProfileBusiness = self.importNamespace(
    'WAWebBusinessProfileModel'
  )
  window.Store.sendDelete = self.importNamespace(
    'WAWebDeleteChatAction'
  ).sendDelete
  window.Store.pinChat = self.importNamespace('WAWebSetPinChatAction')
  window.Store.Survey = self.importNamespace(
    'WAWebPollsSendPollCreationMsgAction'
  )
  window.Store.Reactions = self.importNamespace('WAWebSendReactionMsgAction')
  window.Store.MediaCollection = self.importNamespace(
    'WAWebAttachMediaCollection'
  ).default
  window.Store.onlySendAdmin = self.importNamespace('WAWebGroupModifyInfoJob')
  window.Store.SendCommunity = self.importNamespace('WAWebGroupCommunityJob')
  window.Store.Wap = self.importNamespace('WAWebGroupCreateJob')

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
