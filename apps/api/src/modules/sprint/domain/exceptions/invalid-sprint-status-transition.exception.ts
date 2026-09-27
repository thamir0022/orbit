import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class InvalidSprintStatusTransitionException extends DomainException {
  constructor(message = 'This sprint cannot be moved to its current state.') {
    super({
      code: 'INVALID_SPRINT_STATUS_TRANSITION',
      message,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
