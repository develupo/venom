export async function processFiles(chat, blobs, typeFile) {
  if (!Array.isArray(blobs)) {
    blobs = [blobs]
  }
  const mediaCollection = new Store.MediaCollection({
    chatParticipantCount: chat.getParticipantCount(),
  })

  await mediaCollection.processAttachments(
    Debug.VERSION === '0.4.613'
      ? blobs
      : blobs.map((blob) => {
          if (typeFile) {
            return {
              file: blob,
              type: typeFile,
            }
          }
          return {
            file: blob,
          }
        }),
    chat,
    chat
  )
  return mediaCollection
}
