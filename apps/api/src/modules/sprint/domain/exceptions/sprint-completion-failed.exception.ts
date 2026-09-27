import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class SprintCompletionFailedException extends DomainException {
  constructor() {
    super({
      code: 'SPRINT_COMPLETION_FAILED',
      message: 'This sprint can only be completed while it is active.',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
