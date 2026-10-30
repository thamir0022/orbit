import { Inject, Injectable } from '@nestjs/common'
import { SPRINT_TRANSACTION_MANAGER } from '../../ports/sprint-transaction-manager.port'
import { ITransactionManager } from '@/shared/application'
import {
  SPRINT_CONTEXT_SERVICE,
  ISprintContextService,
  SprintActorScope,
} from '../../services/sprint-context.service'
import {
  SPRINT_SNAPSHOT_SERVICE,
  ISprintSnapshotService,
} from '../../services/sprint-snapshot.service'
import { IGetSprintSummaryUseCase } from './get-sprint-summary.interface'
import { SprintSummaryOutput } from './get-sprint-summary.output'

/** Returns frozen sprint measurements alongside current progress when applicable. */

@Injectable()
export class GetSprintSummaryUseCase implements IGetSprintSummaryUseCase {
  constructor(
    @Inject(SPRINT_CONTEXT_SERVICE)
    private readonly context: ISprintContextService,
    @Inject(SPRINT_SNAPSHOT_SERVICE)
    private readonly snapshots: ISprintSnapshotService,
    @Inject(SPRINT_TRANSACTION_MANAGER)
    private readonly transactions: ITransactionManager
  ) {}

  // A snapshot read prevents scope totals from mixing different revisions.
  async execute(input: SprintActorScope): Promise<SprintSummaryOutput> {
    return this.transactions.executeTransaction(async (session) => {
      const sprint = await this.context.resolve(
        input,
        'member',
        { session },
        true
      )
      const open = sprint.isPlanned || sprint.isActive
      const live = open
        ? this.snapshots.outcome(
            await this.snapshots.load(input, { session }),
            false,
            sprint.startedAt
          )
        : null
      return {
        sprintId: sprint.id.value,
        status: sprint.status,
        committedAt: sprint.startedAt,
        closedAt: sprint.completedAt ?? sprint.cancelledAt,
        commitment: sprint.commitment,
        outcome: sprint.outcome,
        live,
        cancelledBy: sprint.cancelledBy?.value ?? null,
        startedBy: sprint.startedBy?.value ?? null,
        completedBy: sprint.completedBy?.value ?? null,
        cancellationReason: sprint.cancellationReason,
      }
    })
  }
}
