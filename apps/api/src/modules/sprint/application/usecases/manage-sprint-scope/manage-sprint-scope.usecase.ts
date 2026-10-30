import { Inject, Injectable } from '@nestjs/common'
import { SPRINT_TRANSACTION_MANAGER } from '../../ports/sprint-transaction-manager.port'
import { ITransactionManager } from '@/shared/application'
import { UuidUtil } from '@/shared/utils'
import { SprintWorkItem } from '../../../domain/entities/sprint-work-item.entity'
import { SprintValidationException } from '../../../domain/exceptions/sprint-validation.exception'
import { SprintConflictException } from '../../../domain/exceptions/sprint-conflict.exception'
import {
  SPRINT_CONTEXT_SERVICE,
  ISprintContextService,
} from '../../services/sprint-context.service'
import {
  SPRINT_REPOSITORY,
  SprintRepository,
} from '../../ports/sprint-repository.port'
import {
  SPRINT_WORK_ITEM_REPOSITORY,
  SprintWorkItemRepository,
} from '../../ports/sprint-work-item-repository.port'
import { ManageSprintScopeInput } from './manage-sprint-scope.input'
import { IManageSprintScopeUseCase } from './manage-sprint-scope.interface'
import { SprintAssignmentState } from '@/modules/sprint/domain/enums/sprint-assignment-state.enum'

/** Adds or removes sprint assignments while retaining every assignment episode. */

@Injectable()
export class ManageSprintScopeUseCase implements IManageSprintScopeUseCase {
  constructor(
    @Inject(SPRINT_CONTEXT_SERVICE)
    private readonly context: ISprintContextService,
    @Inject(SPRINT_REPOSITORY) private readonly sprints: SprintRepository,
    @Inject(SPRINT_WORK_ITEM_REPOSITORY)
    private readonly assignments: SprintWorkItemRepository,
    @Inject(SPRINT_TRANSACTION_MANAGER)
    private readonly transactions: ITransactionManager
  ) {}
  // PUT and DELETE are idempotent while the sprint remains editable.
  async execute(input: ManageSprintScopeInput) {
    return this.transactions.executeTransaction(async (session) => {
      const options = { session }
      const sprint = await this.context.resolve(input, 'member', options)
      sprint.ensureScopeEditable()
      const current = await this.assignments.findCurrent(
        input.workspaceId,
        input.workItemId,
        options
      )
      if (current && current.toSnapshot().sprintId !== sprint.id.value) {
        if (input.action === 'remove') return { assignment: null }
        throw new SprintConflictException(
          'Remove the current sprint assignment before assigning another sprint.'
        )
      }
      if (input.action === 'assign' && current)
        return { assignment: current.toSnapshot() }
      if (input.action === 'remove' && !current) return { assignment: null }
      const [item] = await this.assignments.readItems(
        input.workspaceId,
        input.teamId,
        [input.workItemId],
        options
      )
      let assignment: SprintWorkItem
      if (input.action === 'assign') {
        if (!item || item.deleted)
          throw new SprintValidationException(
            'Select a non-deleted work item owned by this team.'
          )
        const previous = await this.assignments.findLatest(
          input.workspaceId,
          input.workItemId,
          options
        )
        assignment = SprintWorkItem.assign({
          ...input,
          workspaceId: sprint.workspaceId.value,
          teamId: sprint.teamId.value,
          sprintId: sprint.id.value,
          id: UuidUtil.generate(),
          addedBy: input.actorId,
          addedDuringActive: sprint.isActive,
          snapshot: item,
          at: new Date(),
          previous: previous?.toSnapshot(),
        })
      } else {
        assignment = current!
        assignment.close(
          SprintAssignmentState.REMOVED,
          input.actorId,
          new Date(),
          item ?? {
            ...assignment.toSnapshot().assignedSnapshot,
            deleted: true,
          },
          input.reason
        )
      }
      // Updating the sprint serializes assignments against start and completion.
      await this.sprints.update(sprint, options)
      await this.assignments.saveMany([assignment], options)
      return { assignment: assignment.toSnapshot() }
    })
  }
}
