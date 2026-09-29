import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class WorkItemProjectMismatchException extends DomainException {
  constructor() {
    super({
      code: 'WORK_ITEM_PROJECT_MISMATCH',
      message: 'The work item does not belong to the specified project',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
