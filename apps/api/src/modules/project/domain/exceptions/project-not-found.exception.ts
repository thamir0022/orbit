import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class ProjectNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'PROJECT_NOT_FOUND',
      message: 'Project not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
