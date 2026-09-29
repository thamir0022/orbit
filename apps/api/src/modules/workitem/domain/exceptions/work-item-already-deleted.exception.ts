import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemAlreadyDeletedException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_ALREADY_DELETED',
      message: 'Work item is already deleted',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
