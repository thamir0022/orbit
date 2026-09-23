import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class TeamAlreadyExistsException extends DomainException {
  constructor(name?: string) {
    super({
      code: 'TEAM_EXISTS',
      message: name
        ? `Team with name ${name} already exists`
        : 'Team already exists',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
