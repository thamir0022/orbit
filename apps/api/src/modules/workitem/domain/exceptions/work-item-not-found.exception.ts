import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_NOT_FOUND',
      message: 'Work item not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
