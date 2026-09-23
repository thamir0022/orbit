import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '../value-objects/team-id.vo'
import { TeamStatus } from '../enums/team-status.enum'

export interface TeamProps {
  readonly id: TeamId
  readonly workspaceId: WorkspaceId
  readonly name: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly leadId: UserId | null
  readonly status: TeamStatus
  readonly createdBy: UserId
  readonly deletedAt: Date | null
  readonly deletedBy: UserId | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface CreateTeamProps {
  readonly workspaceId: string
  readonly name: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly leadId?: string
  readonly createdBy: string
}

export interface UpdateTeamProps {
  readonly name?: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly leadId?: string
  readonly status?: TeamStatus
}
