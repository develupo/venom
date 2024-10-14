export async function addChatWapi() {
  window.Store.MaybeMeUser = self.importNamespace('WAWebUserPrefsMeUser')
  window.Store.WAWebMediaHosts =
    self.importNamespace('WAWebMediaHosts').mediaHosts
  window.Store.checkNumber = self.importNamespace('WAWebQueryExistsJob')
  window.Store.checkNumberBeta = self.importNamespace('WAWebQueryExistsJob')
  window.Store.Chat = self.importNamespace('WAWebCollections').default.Chat
  window.Store.sendDeleteMsgs = self.importNamespace(
    'WAWebChatSendMessages'
  ).sendDeleteMsgs
  window.Store.sendRevokeMsgs = self.importNamespace(
    'WAWebChatSendMessages'
  ).sendRevokeMsgs
  window.Store.Participants = self.importNamespace(
    'WAWebModifyParticipantsGroupAction'
  )
  window.Store.GroupModifyParticipantsJob = self.importNamespace(
    'WAWebGroupModifyParticipantsJob'
  )
  window.Store.GroupCreateJob = self.importNamespace('WAWebGroupCreateJob')
  window.Store.infoGroup = self.importNamespace('WAWebQueryGroupAction')
  window.Store.GroupInvite = self.importNamespace('WAWebGroupInviteAction')
  window.Store.Vcard = self.importNamespace('WAWebFrontendVcardUtils')

  if (window.Store?.BusinessProfile) {
    Store.Chat._findAndParse = Store.BusinessProfile._findAndParse
    Store.Chat._find = Store.BusinessProfile._find
  }
}
