import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class InvalidSprintDateRangeException extends DomainException {
  constructor() {
    super({
      code: 'INVALID_SPRINT_DATE_RANGE',
      message: 'The sprint end date must be after the start date.',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}
