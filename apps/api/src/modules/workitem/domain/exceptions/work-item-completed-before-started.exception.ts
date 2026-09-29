import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemCompletedBeforeStartedException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_COMPLETED_BEFORE_STARTED',
      message: 'A work item cannot be completed before it is started',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
