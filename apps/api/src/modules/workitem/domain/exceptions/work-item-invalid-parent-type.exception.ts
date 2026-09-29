import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemInvalidParentTypeException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_INVALID_PARENT_TYPE',
      message: 'The selected parent work item type is not allowed',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
