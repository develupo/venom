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
        msg: `Message with passId: ${passId.id} already in process of sending`,
      },
    }
  }

  await previousMsg.resend()
  return {
    exists: true,
    scope: {
      error: true,
      status: 200,
      msg: `Message with passId: ${passId.id} with failure resent`,
    },
  }
}
