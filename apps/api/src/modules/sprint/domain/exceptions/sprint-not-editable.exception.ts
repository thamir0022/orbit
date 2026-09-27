import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class SprintNotEditableException extends DomainException {
  constructor() {
    super({
      code: 'SPRINT_NOT_EDITABLE',
      message: 'This sprint can no longer be edited.',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
