import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemNotDeletedException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_NOT_DELETED',
      message: 'Work item is not deleted',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
