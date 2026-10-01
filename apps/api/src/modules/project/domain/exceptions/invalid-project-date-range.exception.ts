import { HttpStatus } from '@nestjs/common'

import { DomainException } from '@/shared/domain'

export class InvalidProjectDateRangeException extends DomainException {
  constructor() {
    super({
      code: 'INVALID_PROJECT_DATE_RANGE',
      message: 'Project target end date cannot be before start date',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}
