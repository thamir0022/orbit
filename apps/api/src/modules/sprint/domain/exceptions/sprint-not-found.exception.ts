import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class SprintNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'SPRINT_NOT_FOUND',
      message: 'We couldn’t find that sprint.',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
