import { customImportNamespace } from '../store/custom-import-namespace'

export async function addChatWapi() {
  window.Store.MaybeMeUser = customImportNamespace('WAWebUserPrefsMeUser')
  window.Store.WAWebMediaHosts =
    customImportNamespace('WAWebMediaHosts')?.mediaHosts
  window.Store.checkNumber = customImportNamespace('WAWebQueryExistsJob')
  window.Store.checkNumberBeta = customImportNamespace('WAWebQueryExistsJob')
  window.Store.Chat = customImportNamespace('WAWebCollections')?.default?.Chat
  window.Store.sendDeleteMsgs = customImportNamespace(
    'WAWebChatSendMessages'
  )?.sendDeleteMsgs
  window.Store.sendRevokeMsgs = customImportNamespace(
    'WAWebChatSendMessages'
  )?.sendRevokeMsgs
  window.Store.Participants = customImportNamespace(
    'WAWebModifyParticipantsGroupAction'
  )
  window.Store.GroupModifyParticipantsJob = customImportNamespace(
    'WAWebGroupModifyParticipantsJob'
  )
  window.Store.GroupCreateJob = customImportNamespace('WAWebGroupCreateJob')
  window.Store.infoGroup = customImportNamespace('WAWebQueryGroupAction')
  window.Store.GroupInvite = customImportNamespace('WAWebGroupInviteAction')
  window.Store.Vcard = customImportNamespace('WAWebFrontendVcardUtils')

  if (window.Store?.BusinessProfile) {
    Store.Chat._findAndParse = Store.BusinessProfile._findAndParse
    Store.Chat._find = Store.BusinessProfile._find
  }
}
