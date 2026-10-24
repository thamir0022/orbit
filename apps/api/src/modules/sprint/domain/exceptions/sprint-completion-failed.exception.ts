import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class SprintCompletionFailedException extends DomainException {
  constructor(
    message: string = 'This sprint can only be completed while it is active.'
  ) {
    super({
      code: 'SPRINT_COMPLETION_FAILED',
      message,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
