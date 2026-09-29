import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemTitleNotAllowedException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_TITLE_NOT_ALLOWED',
      message: 'Work item title cannot be empty',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
