import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class SprintCancellationFailedException extends DomainException {
  constructor(
    message: string = 'Only planned or active sprints can be cancelled.'
  ) {
    super({
      code: 'SPRINT_CANCELLATION_FAILED',
      message,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
