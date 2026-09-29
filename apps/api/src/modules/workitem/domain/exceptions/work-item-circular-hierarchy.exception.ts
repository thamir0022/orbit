import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemCircularHierarchyException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_CIRCULAR_HIERARCHY',
      message: 'A work item cannot create a circular parent hierarchy',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
