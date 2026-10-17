import { TeamStatus } from '../../../domain/enums/team-status.enum'

export interface UpdateTeamInput {
  readonly workspaceId: string
  readonly teamKey: string
  readonly name?: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly leadId?: string
  readonly status?: TeamStatus
}
