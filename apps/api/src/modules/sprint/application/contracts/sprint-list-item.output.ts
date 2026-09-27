import { UserSummaryOutput } from '@/shared/application/contracts'

import { SprintStatus } from '../../domain/enums/sprint-status.enum'

/**
 * Read-optimized representation of a sprint for list views.
 *
 * This output may contain enriched data returned by dedicated
 * query repositories and does not need to mirror the domain entity.
 */
export interface SprintListItemOutput {
  id: string

  name: string
  goal?: string

  status: SprintStatus

  startDate: Date
  endDate: Date

  committedPoints: number | null
  completedPoints: number | null

  createdBy: UserSummaryOutput

  startedAt: Date | null
  completedAt: Date | null

  cancelledAt: Date | null
  cancelledBy: UserSummaryOutput | null

  createdAt: Date
  updatedAt: Date
}
