import { TeamMemberListItem } from '../../contracts/team-member-list-item.output'

/** Current team membership after the requested additions are applied. */
export interface AddTeamMembersOutput {
  readonly members: TeamMemberListItem[]
}
