import { Inject, Injectable } from '@nestjs/common'
import { ITransactionOptions } from '@/shared/application'
import {
  SPRINT_WORK_ITEM_REPOSITORY,
  SprintWorkItemRepository,
  SprintScope,
} from '../ports/sprint-work-item-repository.port'
import { SprintWorkItem } from '../../domain/entities/sprint-work-item.entity'
import {
  SprintItemSnapshot,
  SprintOutcome,
  measureSprintItems,
} from '../../domain/interfaces/sprint-snapshot.interface'
import { SprintAssignmentState } from '../../domain/enums/sprint-assignment-state.enum'

export interface SprintScopeSnapshot {
  assignments: SprintWorkItem[]
  current: Map<string, SprintItemSnapshot>
}

export interface ISprintSnapshotService {
  load(
    scope: SprintScope,
    options?: ITransactionOptions
  ): Promise<SprintScopeSnapshot>
  outcome(
    snapshot: SprintScopeSnapshot,
    completing: boolean,
    startedAt: Date | null,
    cancelling?: boolean
  ): SprintOutcome
}

export const SPRINT_SNAPSHOT_SERVICE = Symbol('SprintSnapshotService')

/** Builds consistent scope measurements from assignment history and work items. */

@Injectable()
export class SprintSnapshotService implements ISprintSnapshotService {
  constructor(
    @Inject(SPRINT_WORK_ITEM_REPOSITORY)
    private readonly repository: SprintWorkItemRepository
  ) {}

  // Missing work items are retained as deleted snapshots for audit purposes.
  async load(
    scope: SprintScope,
    options?: ITransactionOptions
  ): Promise<SprintScopeSnapshot> {
    const assignments = await this.repository.findBySprint(scope, options)
    const active = assignments
      .map((item) => item.toSnapshot())
      .filter((item) => item.current)
    const records = await this.repository.readItems(
      scope.workspaceId,
      scope.teamId,
      active.map((item) => item.workItemId),
      options
    )
    const current = new Map(records.map((item) => [item.id, item]))
    for (const item of active)
      if (!current.has(item.workItemId))
        current.set(item.workItemId, {
          ...item.assignedSnapshot,
          deleted: true,
        })
    return { assignments, current }
  }

  // Completed and cancelled items never roll into the next sprint.
  outcome(
    snapshot: SprintScopeSnapshot,
    completing: boolean,
    startedAt: Date | null,
    cancelling = false
  ): SprintOutcome {
    const items = [...snapshot.current.values()]
    const history = snapshot.assignments.map((item) => item.toSnapshot())
    return {
      scope: measureSprintItems(items),
      completed: measureSprintItems(
        items.filter((item) => !item.deleted && item.status === 'done')
      ),
      rolledOver: measureSprintItems(
        completing
          ? items.filter(
              (item) =>
                !item.deleted &&
                item.status !== 'done' &&
                item.status !== 'cancelled'
            )
          : []
      ),
      cancelled: measureSprintItems(
        items.filter(
          (item) =>
            item.deleted ||
            item.status === 'cancelled' ||
            (cancelling && item.status !== 'done')
        )
      ),
      added: measureSprintItems(
        history
          .filter((item) => item.addedDuringActive)
          .map((item) => item.assignedSnapshot)
      ),
      removed: measureSprintItems(
        history
          .filter(
            (item) =>
              item.state === SprintAssignmentState.REMOVED &&
              startedAt &&
              item.removedAt &&
              item.removedAt >= startedAt
          )
          .map((item) => item.closedSnapshot ?? item.assignedSnapshot)
      ),
    }
  }
}
