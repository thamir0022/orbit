import { UserSummaryOutput } from '@/shared/application/contracts'
import { TeamMemberStatus } from '../../domain/enums/team-member-status.enum'

export interface TeamMemberListItem {
  readonly userId: UserSummaryOutput
  readonly status: TeamMemberStatus
  readonly addedBy: UserSummaryOutput
  readonly joinedAt: Date
}
