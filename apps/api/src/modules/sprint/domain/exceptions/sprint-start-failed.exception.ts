import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class SprintStartFailedException extends DomainException {
  constructor() {
    super({
      code: 'SPRINT_START_FAILED',
      message: 'This sprint can only be started while it is planned.',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
