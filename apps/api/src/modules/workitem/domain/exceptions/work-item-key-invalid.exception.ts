import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemKeyInvalidException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_KEY_INVALID',
      message: 'Work item key is invalid',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    })
  }
}
