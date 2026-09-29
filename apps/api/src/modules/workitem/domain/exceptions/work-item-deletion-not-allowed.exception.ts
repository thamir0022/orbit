import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemDeletionNotAllowedException extends DomainException {
  constructor(reason?: string) {
    super({
      code: 'WORK_ITEM_DELETION_NOT_ALLOWED',
      message: reason ?? 'This work item cannot be deleted',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
