import { TeamMemberStatus } from '../../domain/enums/team-member-status.enum'

/** Identifies the actor who added a user to the team. */
export interface TeamMemberAddedByOutput {
  readonly id: string
  readonly email: string
  readonly displayName: string
  readonly avatarUrl: string | null
}

/** Read model returned by team membership commands and queries. */
export interface TeamMemberListItem {
  readonly id: string
  readonly firstName: string
  readonly lastName: string
  readonly displayName: string
  readonly email: string
  readonly status: TeamMemberStatus
  readonly joinedAt: Date
  readonly addedBy: TeamMemberAddedByOutput
}
