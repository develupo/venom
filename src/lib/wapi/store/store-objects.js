export const storeObjects = [
  {
    // Note - Imported again with name 'Chat' in filtered Objects (addChatApi)
    id: 'module',
    conditions: (module) =>
      module.default && module.default.Chat && module.default.Msg
        ? module.default
        : null,
    wppModule: 'WAWebCollections',
  },
  {
    id: 'replyButton',
    conditions: (module) =>
      module.__esModule &&
      module.default &&
      module.default.prototype &&
      module.default.prototype.proxyName === 'replyButton'
        ? module.default
        : null,
  },
  {
    id: 'templateButton',
    conditions: (module) =>
      module.__esModule &&
      module.default &&
      module.default.prototype &&
      module.default.prototype.proxyName === 'templateButton'
        ? module.default
        : null,
  },
  {
    id: 'TemplateButtonCollection',
    conditions: (module) =>
      module.TemplateButtonCollection ? module.TemplateButtonCollection : null,
    wppModule: 'WAWebTemplateButtonCollection',
  },
  {
    id: 'ButtonCollection',
    conditions: (module) =>
      module.ButtonCollection ? module.ButtonCollection : null,
    wppModule: 'WAWebButtonCollection',
  },
  {
    id: 'MediaCollection',
    conditions: (module) =>
      module.default &&
      module.default.prototype &&
      (module.default.prototype.processFiles !== undefined ||
        module.default.prototype.processAttachments !== undefined)
        ? module.default
        : null,
    wppModule: 'WAWebAttachMediaCollection',
  },
  {
    id: 'MediaProcess',
    conditions: (module) => (module.BLOB ? module : null),
    wppModule: 'WAWebImageUtils',
  },
  {
    id: 'ChatUtil',
    conditions: (module) => (module.sendClear ? module : null),
    wppModule: 'WAWebChatClearBridge',
  },
  {
    id: 'GroupInvite',
    conditions: (module) =>
      module.queryGroupInviteCode && module.revokeGroupInvite ? module : null,
    wppModule: 'WAWebGroupInviteAction',
  },
  {
    // FIXME - Duplicated id with WAWap.
    id: 'Wap',
    conditions: (module) => (module.createGroup ? module : null),
    wppModule: 'WAWebGroupCreateJob',
  },
  {
    id: 'ServiceWorker',
    conditions: (module) =>
      module.default && module.default.killServiceWorker ? module : null,
  },
  {
    id: 'WapDelete',
    conditions: (module) =>
      module.sendConversationDelete &&
      module.sendConversationDelete.length === 2
        ? module
        : null,
  },
  {
    id: 'Conn',
    conditions: (module) =>
      module.default && module.default.ref && module.default.refTTL
        ? module.default
        : null,
  },
  {
    id: 'WapQuery',
    conditions: (module) =>
      module.default &&
      module.default.contactFindQuery &&
      module.default.queryExist
        ? module.default
        : null,
  },
  {
    id: 'CryptoLib',
    conditions: (module) => (module.decryptE2EMedia ? module : null),
  },
  {
    id: 'OpenChat',
    conditions: (module) =>
      module.default &&
      module.default.prototype &&
      module.default.prototype.openChat
        ? module.default
        : null,
  },
  {
    id: 'UserConstructor',
    conditions: (module) =>
      module.default &&
      module.default.prototype &&
      module.default.prototype.isServer &&
      module.default.prototype.isUser
        ? module.default
        : null,
    wppModule: 'WAWebWid',
  },
  {
    id: 'SendTextMsgToChat',
    conditions: (module) =>
      module.sendTextMsgToChat ? module.sendTextMsgToChat : null,
    wppModule: 'WAWebSendTextMsgChatAction',
  },
  {
    id: 'Archive',
    conditions: (module) => (module.setArchive ? module : null),
    wppModule: 'WAWebChatDbUpdatesApi',
  },
  {
    id: 'pinChat',
    conditions: (module) => (module.setPin ? module : null),
    wppModule: 'WAWebSetPinChatAction',
  },
  {
    id: 'sendDelete',
    conditions: (module) => (module.sendDelete ? module.sendDelete : null),
    wppModule: 'WAWebDeleteChatAction',
  },
  {
    id: 'addAndSendMsgToChat',
    conditions: (module) =>
      module.addAndSendMsgToChat ? module.addAndSendMsgToChat : null,
    wppModule: 'WAWebSendMsgChatAction',
  },
  {
    id: 'sendMsgToChat',
    conditions: (module) =>
      module.sendMsgToChat ? module.sendMsgToChat : null,
  },
  {
    id: 'Catalog',
    conditions: (module) => (module.Catalog ? module.Catalog : null),
  },
  {
    id: 'Perfil',
    conditions: (module) =>
      module.__esModule === true &&
      module.setPushname &&
      !module.getComposeContents
        ? module
        : null,
  },
  {
    id: 'MsgKey',
    conditions: (module) =>
      module.default &&
      module.default.toString &&
      typeof module.default.toString === 'function' &&
      module.default.toString().includes('MsgKey error: obj is null/undefined')
        ? module.default
        : null,
    wppModule: 'WAWebMsgKey',
  },
  {
    id: 'Parser',
    conditions: (module) =>
      module.convertToTextWithoutSpecialEmojis ? module : null,
    wppModule: 'WAWebConvertToTextWithoutSpecialEmojis',
  },
  {
    id: 'Builders',
    conditions: (module) =>
      module.TemplateMessage && module.HydratedFourRowTemplate ? module : null,
  },
  {
    id: 'Me',
    conditions: (module) =>
      module.Conn && module.ConnImpl ? module.Conn : null,
    wppModule: 'WAWebConnModel',
  },
  {
    id: 'CallUtils',
    conditions: (module) =>
      module.sendCallEnd && module.parseCall ? module : null,
  },
  {
    id: 'Identity',
    conditions: (module) =>
      module.queryIdentity && module.updateIdentity ? module : null,
  },
  {
    id: 'MyStatus',
    conditions: (module) =>
      module.getStatus && module.setMyStatus ? module : null,
    wppModule: 'WAWebContactStatusBridge',
  },
  {
    id: 'ChatStates',
    conditions: (module) =>
      module.sendChatStatePaused &&
      module.sendChatStateRecording &&
      module.sendChatStateComposing
        ? module
        : null,
    wppModule: 'WAWebChatStateBridge',
  },
  {
    id: 'GroupActions',
    conditions: (module) =>
      module.sendExitGroup && module.localExitGroup ? module : null,
    wppModule: 'WAWebExitGroupAction',
  },
  {
    id: 'Features',
    conditions: (module) =>
      module.FEATURE_CHANGE_EVENT && module.features ? module : null,
  },
  {
    id: 'MessageUtils',
    conditions: (module) =>
      module.storeMessages && module.appendMessage ? module : null,
  },
  {
    id: 'createMessageKey',
    conditions: (module) =>
      module.createMessageKey && module.createDeviceSentMessage
        ? module.createMessageKey
        : null,
  },
  {
    id: 'WidFactory',
    conditions: (module) =>
      module.isWidlike && module.createWid && module.createWidFromWidLike
        ? module
        : null,
    wppModule: 'WAWebWidFactory',
  },
  {
    id: 'Base',
    conditions: (module) =>
      module.setSubProtocol && module.binSend && module.actionNode
        ? module
        : null,
  },
  {
    id: 'Base2',
    conditions: (module) =>
      module.supportsFeatureFlags &&
      module.parseMsgStubProto &&
      module.binSend &&
      module.subscribeLiveLocation
        ? module
        : null,
  },
  {
    // Note - Imported again with same name in filtered Objects (addChatApi)
    id: 'MaybeMeUser',
    conditions: (module) => (module.getMaybeMeUser ? module : null),
    wppModule: 'WAWebUserPrefsMeUser',
  },
  {
    id: 'Sticker',
    conditions: (module) => (module.StickerCollection ? module : null),
    wppModule: 'WAWebStickerCollection',
  },
  {
    id: 'MediaObject',
    conditions: (module) =>
      module.getOrCreateMediaObject && module.disassociateMediaFromStickerPack
        ? module
        : null,
    wppModule: 'WAWebMediaStorage',
  },
  {
    id: 'MediaUpload',
    conditions: (module) =>
      module.default && module.default.mediaUpload ? module.default : null,
  },
  {
    id: 'UploadUtils',
    conditions: (module) =>
      module.default && module.default.encryptAndUpload ? module.default : null,
    wppModule: 'WAWebUploadManager',
  },
  {
    id: 'Cmd',
    conditions: (module) => (module.CmdImpl && module.Cmd ? module.Cmd : null),
    wppModule: 'WAWebCmd',
  },
  {
    id: 'ReadSeen',
    conditions: (module) => (module.sendSeen ? module : null),
    wppModule: 'WAWebUpdateUnreadChatAction',
  },
  {
    id: 'Block',
    conditions: (module) =>
      module.blockContact && module.unblockContact ? module : null,
    wppModule: 'WAWebBlockContactAction',
  },
  {
    id: 'BlockList',
    conditions: (module) => (module.BlocklistCollection ? module : null),
    wppModule: 'WAWebBlocklistCollection',
  },
  {
    id: 'Theme',
    conditions: (module) =>
      module.getTheme && module.setTheme ? module : null,
    wppModule: 'WAWebUserPrefsGeneral',
  },
  {
    id: 'Vcard',
    conditions: (module) => (module.vcardFromContactModel ? module : null),
    wppModule: 'WAWebFrontendVcardUtils',
  },
  {
    id: 'Profile',
    conditions: (module) =>
      module.sendSetPicture && module.requestDeletePicture ? module : null,
    wppModule: 'WAWebContactProfilePicThumbBridge',
  },
  {
    id: 'SendMute',
    conditions: (module) => (module.sendConversationMute ? module : null),
    wppModule: 'WAWebChatMuteBridge',
  },
  {
    id: 'Validators',
    conditions: (module) => (module.findLinks ? module : null),
    wppModule: 'WALinkify',
  },
  { id: 'Wap2', conditions: (module) => (module.Wap ? module : null) },
  {
    id: 'genId',
    conditions: (module) =>
      module.default &&
      typeof module.default === 'function' &&
      module.default.toString().match(/crypto/)
        ? module
        : null,
    wppModule: 'WAWebPonyfillsCryptoRandomUUID',
  },
  {
    id: 'GroupMetadata',
    conditions: (module) =>
      module.default && module.default.handlePendingInvite ? module : null,
  },
  {
    id: 'i10n',
    conditions: (module) =>
      module.default && module.default.downloadAppLocale
        ? module.default
        : null,
  },
  {
    id: 'NetworkStatus',
    conditions: (module) =>
      module.default && module.default._logOnlineOffline
        ? module.default
        : null,
  },
  {
    id: 'Stream',
    conditions: (module) =>
      module.Stream && module.StreamInfo ? module.Stream : null,
    wppModule: 'WAWebStreamModel',
  },
  {
    id: 'State',
    conditions: (module) => (module.Socket ? module : null),
    wppModule: 'WAWebSocketModel',
  },
  {
    id: 'ws2',
    conditions: (module) =>
      module.default && module.default.destroyStorage ? module.default : null,
  },
  {
    id: 'Login',
    conditions: (module) => (module.startLogout ? module : null),
    wppModule: 'WAWebCompanionRegUtils',
  },
  {
    id: 'BlobCache',
    conditions: (module) =>
      module.default && module.default.getOrCreateURL ? module.default : null,
  },
  {
    id: 'Presence',
    conditions: (module) =>
      module.setPresenceAvailable && module.setPresenceUnavailable
        ? module
        : null,
    wppModule: 'WAWebContactPresenceBridge',
  },
  {
    id: 'PresenceCollection',
    conditions: (module) => (module.PresenceCollection ? module : null),
    wppModule: 'WAWebPresenceCollection',
  },
  {
    id: 'chatOptions',
    conditions: (module) =>
      module.default && module.default.archiveChat ? module.default : null,
  },
  {
    id: 'blob',
    conditions: (module) =>
      module.default && module.default.createFromData ? module : null,
    wppModule: 'WAWebMediaOpaqueData',
  },
  {
    id: 'GroupDesc',
    conditions: (module) => (module.setGroupDesc ? module : null),
  },
  {
    id: 'infoGroup',
    conditions: (module) => (module.queryGroupInviteInfo ? module : null),
    wppModule: 'WAWebQueryGroupAction',
  },
  {
    id: 'GroupTitle',
    conditions: (module) => (module.sendSetGroupSubject ? module : null),
  },
  {
    id: 'GroupSettings',
    conditions: (module) => (module.sendSetGroupProperty ? module : null),
  },
  {
    id: 'createGroup',
    conditions: (module) =>
      module.createGroup && module.sendForNeededAddRequest
        ? module.createGroup
        : null,
    wppModule: 'WAWebCreateGroupAction',
  },
  {
    id: 'SetStatusChat',
    conditions: (module) =>
      module.markComposing && module.markRecording ? module : null,
    wppModule: 'WAWebPresenceChatAction',
  },
  {
    id: 'Reactions',
    conditions: (module) => (module.sendReactionToMsg ? module : null),
    wppModule: 'WAWebSendReactionMsgAction',
  },
  {
    id: 'CheckWid',
    conditions: (module) => (module.validateWid ? module : null),
    wppModule: 'WAWebWidValidator',
  },
  {
    id: 'ProfileBusiness',
    conditions: (module) => (module.BUSINESS_URL_DOMAIN ? module : null),
    wppModule: 'WAWebBusinessProfileModel',
  },
  {
    id: 'Contacts',
    conditions: (module) => (module.ContactCollection ? module : null),
    wppModule: 'WAWebContactCollection',
  },
  {
    id: 'onlySendAdmin',
    conditions: (module) =>
      module.setGroupProperty && module.setGroupDescription ? module : null,
    wppModule: 'WAWebGroupModifyInfoJob',
  },
  {
    id: 'SendCommunity',
    conditions: (module) => (module.sendCreateCommunity ? module : null),
    wppModule: 'WAWebGroupCommunityJob',
  },
  {
    id: 'Websocket',
    conditions: (module) => (module.smax ? module : null),
    wppModule: 'WASmaxJsx',
  },
  {
    id: 'Survey',
    conditions: (module) => (module.sendPollCreation ? module : null),
    wppModule: 'WAWebPollsSendPollCreationMsgAction',
  },
  {
    // FIXME - Duplicated id with WAWebGroupCreateJob.
    id: 'Wap',
    conditions: (module) => (module.BIG_ENDIAN_CONTENT ? module : null),
    wppModule: 'WAWap',
  },
  {
    id: 'WapParser',
    conditions: (module) => (module.WapParser ? module : null),
  },
  {
    id: 'SendSocket',
    conditions: (module) => (module.deprecatedSendIq ? module : null),
    wppModule: 'WADeprecatedSendIq',
  },
  {
    id: 'Jid',
    conditions: (module) => (module.WAP_JID_SUBTYPE ? module : null),
    wppModule: 'WAWapJid',
  },
  {
    // TODO - Duplicated wppModule with sendRevokeMsgs. That's could be not a problem, just a duplicated reference, but could be too
    id: 'sendDeleteMsgs',
    conditions: (module) =>
      module.sendDeleteMsgs ? module.sendDeleteMsgs : null,
    wppModule: 'WAWebChatSendMessages',
  },
  {
    // TODO - Duplicated with sendDeleteMsgs. That's could be not a problem, just a duplicated reference, but could be too
    id: 'sendRevokeMsgs',
    conditions: (module) =>
      module.sendRevokeMsgs ? module.sendRevokeMsgs : null,
    wppModule: 'WAWebChatSendMessages',
  },
  {
    id: 'createNewsletterQuery',
    conditions: (module) => (module.createNewsletterQuery ? module : null),
    wppModule: 'WAWebNewsletterCreateQueryJob',
  },
  {
    id: 'userJidToUserWid',
    conditions: (module) => (module.newsletterJidToWid ? module : null),
    wppModule: 'WAWebJidToWid',
  },
]
