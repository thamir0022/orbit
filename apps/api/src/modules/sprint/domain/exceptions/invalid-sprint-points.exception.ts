import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class InvalidSprintPointsException extends DomainException {
  constructor() {
    super({
      code: 'INVALID_SPRINT_POINTS',
      message:
        'Sprint points must be a valid whole number greater than or equal to 0.',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}
