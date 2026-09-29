import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemSelfParentException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_SELF_PARENT',
      message: 'A work item cannot be its own parent',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
