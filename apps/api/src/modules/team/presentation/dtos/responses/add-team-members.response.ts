import { TeamMemberListItem } from '../../../application/contracts/team-member-list-item.output'

/** Returns the current members after a successful addition. */
export class AddTeamMembersResponse {
  readonly members!: TeamMemberListItem[]
}
