import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemDueDateBeforeStartedException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_DUE_DATE_BEFORE_STARTED',
      message: 'The due date cannot be earlier than the started date',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
