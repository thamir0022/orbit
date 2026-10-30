import { Inject, Injectable } from '@nestjs/common'
import { SPRINT_TRANSACTION_MANAGER } from '../../ports/sprint-transaction-manager.port'
import { ITransactionManager } from '@/shared/application'
import {
  SPRINT_CONTEXT_SERVICE,
  ISprintContextService,
  SprintActorScope,
} from '../../services/sprint-context.service'
import {
  SPRINT_REPOSITORY,
  SprintRepository,
} from '../../ports/sprint-repository.port'
import {
  SPRINT_WORK_ITEM_REPOSITORY,
  SprintWorkItemRepository,
} from '../../ports/sprint-work-item-repository.port'
import { IDeleteSprintUseCase } from './delete-sprint.interface'
import { UserId } from '@/modules/user/domain'
import { SprintAssignmentState } from '@/modules/sprint/domain/enums/sprint-assignment-state.enum'

/** Soft deletes a planned sprint and detaches assignments atomically. */

@Injectable()
export class DeleteSprintUseCase implements IDeleteSprintUseCase {
  constructor(
    @Inject(SPRINT_CONTEXT_SERVICE)
    private readonly context: ISprintContextService,
    @Inject(SPRINT_REPOSITORY) private readonly sprints: SprintRepository,
    @Inject(SPRINT_WORK_ITEM_REPOSITORY)
    private readonly assignments: SprintWorkItemRepository,
    @Inject(SPRINT_TRANSACTION_MANAGER)
    private readonly transactions: ITransactionManager
  ) {}

  async execute(input: SprintActorScope): Promise<void> {
    await this.transactions.executeTransaction(async (session) => {
      const options = { session }

      const sprint = await this.context.resolve(input, 'lead', options, true)
      const at = new Date()

      const actor = UserId.create(input.actorId)

      sprint.delete(actor, at)

      const assignments = await this.assignments.findBySprint(input, options)
      // Work items remain intact; only their sprint assignment ends.
      for (const assignment of assignments) {
        const row = assignment.toSnapshot()
        if (row.current)
          assignment.close(
            SprintAssignmentState.DELETED,
            input.actorId,
            at,
            row.assignedSnapshot,
            'Planned sprint deleted'
          )
      }
      await this.sprints.update(sprint, options)
      await this.assignments.saveMany(assignments, options)
    })
  }
}
