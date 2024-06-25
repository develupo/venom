export async function sendScopeError(statusCode, code) {
  return await WAPI.scope(null, true, statusCode, { code })
}
