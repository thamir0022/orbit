import { HttpStatus } from '@nestjs/common'

import { DomainException } from '@/shared/domain'

export class ProjectAlreadyDeletedException extends DomainException {
  constructor() {
    super({
      code: 'PROJECT_ALREADY_DELETED',
      message: 'Project has already been deleted',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
