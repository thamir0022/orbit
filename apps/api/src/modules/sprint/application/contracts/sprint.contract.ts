import { SprintStatus } from '../../domain/enums/sprint-status.enum'

/**
 * Application-level representation of a sprint.
 *
 * This contract is used to transfer sprint data between
 * application services and presentation-facing layers.
 */
export interface SprintDto {
  id: string

  workspaceId: string
  teamId: string

  name: string
  goal?: string
  description?: string

  startDate: Date
  endDate: Date

  status: SprintStatus

  committedPoints?: number
  completedPoints?: number

  createdBy: string

  startedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  cancelledBy?: string

  createdAt: Date
  updatedAt: Date
}
