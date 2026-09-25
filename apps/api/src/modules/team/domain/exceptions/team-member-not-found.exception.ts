import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class TeamMemberNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'TEAM_MEMBER_NOT_FOUND',
      message: 'Team memeber not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
