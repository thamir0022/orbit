import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class ProjectAlreadyExistsException extends DomainException {
  constructor(key?: string) {
    super({
      code: 'PROJECT_ALREADY_EXIST',
      message: key
        ? `Project with key ${key} already exists`
        : 'Project already exists',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
