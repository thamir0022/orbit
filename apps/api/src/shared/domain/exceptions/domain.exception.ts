import { HttpStatus } from '@nestjs/common'

interface DomainExceptionProps {
  code: string
  message: string
  statusCode?: HttpStatus
}
/**
 * Base domain exception
 */
export class DomainException extends Error {
  public readonly code: string
  public readonly httpStatusCode: HttpStatus

  constructor({ code, message, statusCode }: DomainExceptionProps) {
    super(message)
    this.name = 'DomainException'
    this.code = code
    this.httpStatusCode = statusCode ?? HttpStatus.BAD_REQUEST
  }
}
