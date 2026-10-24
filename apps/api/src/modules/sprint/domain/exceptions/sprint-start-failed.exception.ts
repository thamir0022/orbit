import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class SprintStartFailedException extends DomainException {
  constructor(
    message: string = 'This sprint can only be started while it is planned.'
  ) {
    super({
      code: 'SPRINT_START_FAILED',
      message,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
