import { SprintMetrics, SprintOutcome } from './sprint-snapshot.interface'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { SprintId } from '../value-objects/sprint-id.vo'
import { SprintStatus } from '../enums/sprint-status.enum'

/**
 * Properties required to reconstitute a sprint aggregate.
 * - Sprint creation
 * - Persistence
 * - Planning contracts
 */
export interface SprintProps {
  id: SprintId

  workspaceId: WorkspaceId
  teamId: TeamId

  name: string
  goal: string | null
  description: string | null

  startDate: Date
  endDate: Date

  status: SprintStatus

  commitment?: SprintMetrics | null
  outcome?: SprintOutcome | null
  startedBy?: string | null
  completedBy?: string | null
  cancellationReason?: string | null
  deletedAt?: Date | null
  deletedBy?: string | null

  createdBy: UserId
  createdAt: Date
  updatedAt: Date

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
  goal: string | null
  description: string | null

  startDate: Date | string
  endDate: Date | string

  createdBy: string
}

/**
 * Null text values explicitly clear the stored field.
 * Fields that can be changed while a sprint is still planned.
 */
export interface UpdateSprintProps {
  name?: string
  goal?: string | null
  description?: string | null

  startDate?: Date | string
  endDate?: Date | string
}
