import { TeamStatus } from '../../../domain/enums/team-status.enum'

/** Defines authenticated team settings updates. */
export interface UpdateTeamInput {
  readonly actorId: string
  readonly workspaceId: string
  readonly key: string
  readonly name?: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly leadId?: string
  readonly status?: TeamStatus
}
