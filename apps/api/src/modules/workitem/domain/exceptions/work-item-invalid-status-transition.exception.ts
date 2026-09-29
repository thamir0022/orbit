import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemInvalidStatusTransitionException extends DomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super({
      code: 'WORK_ITEM_INVALID_STATUS_TRANSITION',
      message: `Cannot transition work item from '${currentStatus}' to '${targetStatus}'`,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
