import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class TeamArchivedException extends DomainException {
  constructor() {
    super({
      code: 'TEAM_ARCHIVED',
      message: 'Team is archived',
      statusCode: HttpStatus.FORBIDDEN,
    })
  }
}
