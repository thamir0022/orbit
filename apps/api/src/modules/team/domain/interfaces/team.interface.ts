import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '../value-objects/team-id.vo'
import { TeamStatus } from '../enums/team-status.enum'

export interface TeamProps {
  readonly id: TeamId
  readonly workspaceId: WorkspaceId
  readonly name: string
  readonly description?: string
  readonly avatar?: string
  readonly leadId?: UserId
  readonly status: TeamStatus
  readonly createdBy: UserId
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface CreateTeamProps {
  readonly workspaceId: WorkspaceId
  readonly name: string
  readonly description?: string
  readonly avatar?: string
  readonly leadId?: UserId
  readonly createdBy: UserId
}

export interface UpdateTeamProps {
  readonly name: string
  readonly description: string
  readonly avatar: string
  readonly leadId: UserId
  readonly status: TeamStatus
}
