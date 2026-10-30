import { SprintValidationException } from '../exceptions/sprint-validation.exception'

/** Defines immutable sprint measurements and work-item snapshots. */
export interface SprintItemSnapshot {
  id: string
  key: string
  title: string
  type: string
  status: string
  points: number | null
  deleted: boolean
}

export interface SprintMetrics {
  items: number
  points: number
  unestimatedItems: number
  byType: Record<string, number>
}

export interface SprintOutcome {
  scope: SprintMetrics
  completed: SprintMetrics
  rolledOver: SprintMetrics
  cancelled: SprintMetrics
  added: SprintMetrics
  removed: SprintMetrics
}

// Each work item contributes its own estimate once, including epics.
export function measureSprintItems(
  items: readonly SprintItemSnapshot[]
): SprintMetrics {
  const unique = new Map(items.map((item) => [item.id, item]))
  const metrics: SprintMetrics = {
    items: unique.size,
    points: 0,
    unestimatedItems: 0,
    byType: {},
  }
  for (const item of unique.values()) {
    if (
      item.points !== null &&
      (!Number.isSafeInteger(item.points) || item.points < 0)
    )
      throw new SprintValidationException(
        'Work-item estimates must be non-negative whole numbers.'
      )
    metrics.points += item.points ?? 0
    metrics.unestimatedItems += item.points === null ? 1 : 0
    metrics.byType[item.type] = (metrics.byType[item.type] ?? 0) + 1
  }
  return metrics
}
