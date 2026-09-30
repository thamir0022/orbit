import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

export class ProjectKeyInvalidException extends DomainException {
  constructor() {
    super({
      code: 'PROJECT_KEY_INVALID',
      message:
        'Project key must contain 2 to 10 uppercase letters or numbers and start with a letter',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    })
  }
}
