import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemDeletedException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_DELETED',
      message: 'Deleted work items cannot be modified',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
