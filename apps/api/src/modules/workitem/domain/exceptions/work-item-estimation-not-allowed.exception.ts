import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemEstimationNotAllowedException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_ESTIMATION_NOT_ALLOWED',
      message: 'Story points must be greater than zero',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
