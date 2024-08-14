export function getMediaConn() {
  const data = Store.WAWebMediaHosts._data
  return {
    auth: data.auth,
    authExpirationTime: data.authExpirationTime.getTime(),
    hosts: data.hosts,
  }
}
