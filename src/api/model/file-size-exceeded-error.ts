export class FileSizeExceededError extends Error {
  fileName: string
  id: string
  fileSize: number

  constructor(message: string, fileName: string, id: string, fileSize: number) {
    super(message)
    this.fileName = fileName
    this.id = id
    this.fileSize = fileSize
  }
}
