import { VALIDATION_MESSAGE_ERROR } from './enum/validation-message-error-list'

export class ValidationMessageError extends Error {
  text: string
  obj?: any

  constructor(text: VALIDATION_MESSAGE_ERROR, obj?: any) {
    super(text)
    this.text = text
    this.obj = obj
  }
}
