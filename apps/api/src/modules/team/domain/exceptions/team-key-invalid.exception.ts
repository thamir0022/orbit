import { HttpStatus } from '@nestjs/common'

import { DomainException } from '@/shared/domain'

export class TeamKeyInvalidException extends DomainException {
  constructor() {
    super({
      code: 'INVALID_TEAM_KEY',
      message: 'The team key is invalid',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}
