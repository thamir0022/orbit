import {
  SprintMetrics,
  SprintOutcome,
} from '../../../domain/interfaces/sprint-snapshot.interface'

export interface SprintSummaryOutput {
  sprintId: string
  status: string
  committedAt: Date | null
  closedAt: Date | null
  commitment: SprintMetrics | null
  outcome: SprintOutcome | null
  live: SprintOutcome | null
  cancelledBy: string | null
  startedBy: string | null
  completedBy: string | null
  cancellationReason: string | null
}
