import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class TeamLeadNotWorkspaceMemberException extends DomainException {
  constructor() {
    super({
      code: 'TEAM_LEAD_NOT_WORKSPACE_MEMBER',
      message: 'The selected team lead must be a member of the workspace',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    })
  }
}
