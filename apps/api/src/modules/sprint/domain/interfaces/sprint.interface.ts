import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { SprintId } from '../value-objects/sprint-id.vo'
import { SprintStatus } from '../enums/sprint-status.enum'

/**
 * Properties required to reconstitute a sprint aggregate.
 */
export interface SprintProps {
  id: SprintId

  workspaceId: WorkspaceId
  teamId: TeamId

  name: string
  goal?: string
  description?: string

  startDate: Date
  endDate: Date

  status: SprintStatus

  committedPoints?: number | null
  completedPoints?: number | null

  createdBy: UserId
  createdAt?: Date
  updatedAt?: Date

  startedAt?: Date | null
  completedAt?: Date | null
  cancelledAt?: Date | null
  cancelledBy?: UserId | null
}

/**
 * Input required to create a new sprint.
 */
export interface CreateSprintProps {
  workspaceId: string
  teamId: string

  name: string
  goal?: string
  description?: string

  startDate: Date | string
  endDate: Date | string

  createdBy: string
}

/**
 * Fields that can be changed while a sprint is still planned.
 */
export interface UpdateSprintProps {
  name?: string
  goal?: string
  description?: string

  startDate?: Date | string
  endDate?: Date | string
}
