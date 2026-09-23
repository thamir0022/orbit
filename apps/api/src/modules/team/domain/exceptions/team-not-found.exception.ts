import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class TeamNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'TEAM_NOT_FOUND',
      message: 'Team not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
