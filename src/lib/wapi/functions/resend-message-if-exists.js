import { MESSAGE_ERRORS } from '../constants/message-errors'

export async function resendMessageIfExists(passId, newMsgId) {
  if (!passId) return { exists: false }

  const previousMsg = await WAPI.getMessageById(
    newMsgId._serialized,
    null,
    false
  )

  if (!previousMsg || previousMsg?.erro) return { exists: false }

  if (!previousMsg?.isSendFailure) {
    return {
      exists: true,
      scope: {
        error: true,
        status: 400,
        msg: MESSAGE_ERRORS.MESSAGE_ALREADY_IN_PROCESS_OF_SENDING,
      },
    }
  }

  await previousMsg.resend()
  return {
    exists: true,
    scope: {
      error: false,
      status: 200,
      msg: `Message with passId: ${passId.id} with failure resent`,
    },
  }
}
