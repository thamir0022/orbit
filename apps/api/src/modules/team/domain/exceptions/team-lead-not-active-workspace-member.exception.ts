import { DomainException } from '@/shared/domain'

export class TeamLeadNotActiveWorkspaceMemberException extends DomainException {
  constructor() {
    super({
      code: 'TEAM_LEAD_NOT_ACTIVE',
      message: 'The selected team lead is not a active workspace member',
    })
  }
}
