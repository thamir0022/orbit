import { HttpStatus } from '@nestjs/common'

import { DomainException } from '@/shared/domain'

export class TeamInactiveException extends DomainException {
  constructor() {
    super({
      code: 'TEAM_INACTIVE',
      message: 'The team is inactive.',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
