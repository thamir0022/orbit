import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class ProjectNotFoundException extends DomainException {
  constructor(key: string) {
    super({
      code: 'PROJECT_NOT_FOUND',
      message: key
        ? `Project with id ${key} is not found`
        : 'Project not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
