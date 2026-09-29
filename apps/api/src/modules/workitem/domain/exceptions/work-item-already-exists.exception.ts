import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemAlreadyExistsException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_ALREADY_EXISTS',
      message: 'A work item with the same identifier already exists',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
