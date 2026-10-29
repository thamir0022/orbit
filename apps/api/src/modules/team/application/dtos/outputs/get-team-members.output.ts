import { TeamMemberListItem } from '../../contracts/team-member-list-item.output'

export interface GetTeamMembersOutput {
  readonly members: TeamMemberListItem[]
}
