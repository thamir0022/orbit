import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class SprintCancellationFailedException extends DomainException {
  constructor() {
    super({
      code: 'SPRINT_CANCELLATION_FAILED',
      message: 'Only planned or active sprints can be cancelled.',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
