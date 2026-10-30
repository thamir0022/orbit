/** Changes sprint lifecycle and assignment history in one transaction. */
import { Inject, Injectable } from '@nestjs/common'
import { SPRINT_TRANSACTION_MANAGER } from '../../ports/sprint-transaction-manager.port'
import { ITransactionManager } from '@/shared/application'
import { UserId } from '@/modules/user/domain'
import { UuidUtil } from '@/shared/utils'
import { SprintStatus } from '../../../domain/enums/sprint-status.enum'
import {
  SprintStartFailedException,
  SprintNotFoundException,
} from '../../../domain/exceptions'
import { SprintValidationException } from '../../../domain/exceptions/sprint-validation.exception'
import { SprintWorkItem } from '../../../domain/entities/sprint-work-item.entity'
import { measureSprintItems } from '../../../domain/interfaces/sprint-snapshot.interface'
import {
  SPRINT_REPOSITORY,
  SprintRepository,
} from '../../ports/sprint-repository.port'
import {
  SPRINT_QUERY_REPOSITORY,
  SprintQueryRepository,
} from '../../ports/sprint-query-repository.port'
import {
  SPRINT_WORK_ITEM_REPOSITORY,
  SprintWorkItemRepository,
} from '../../ports/sprint-work-item-repository.port'
import {
  SPRINT_CONTEXT_SERVICE,
  ISprintContextService,
} from '../../services/sprint-context.service'
import {
  SPRINT_SNAPSHOT_SERVICE,
  ISprintSnapshotService,
} from '../../services/sprint-snapshot.service'
import {
  ITransitionSprintUseCase,
  TransitionSprintInput,
} from './transition-sprint.interface'
import { SprintAssignmentState } from '@/modules/sprint/domain/enums/sprint-assignment-state.enum'

@Injectable()
export class TransitionSprintUseCase implements ITransitionSprintUseCase {
  constructor(
    @Inject(SPRINT_REPOSITORY) private readonly sprints: SprintRepository,
    @Inject(SPRINT_QUERY_REPOSITORY)
    private readonly queries: SprintQueryRepository,
    @Inject(SPRINT_CONTEXT_SERVICE)
    private readonly context: ISprintContextService,
    @Inject(SPRINT_WORK_ITEM_REPOSITORY)
    private readonly assignments: SprintWorkItemRepository,
    @Inject(SPRINT_SNAPSHOT_SERVICE)
    private readonly snapshots: ISprintSnapshotService,
    @Inject(SPRINT_TRANSACTION_MANAGER)
    private readonly transactions: ITransactionManager
  ) {}
  async execute(input: TransitionSprintInput) {
    // Resolve all records inside the transaction so retries use fresh state.
    return this.transactions.executeTransaction(async (session) => {
      const options = { session }
      const sprint = await this.context.resolve(
        input,
        'lead',
        options,
        input.action === 'cancel'
      )
      const scope = {
        workspaceId: sprint.workspaceId,
        teamId: sprint.teamId,
        sprintId: sprint.id,
      }
      const snapshot = await this.snapshots.load(input, options)
      const changedAssignments = snapshot.assignments.filter(
        (item) => item.toSnapshot().current
      )
      const at = new Date()
      if (input.action === 'start') {
        const active = await this.sprints.findByWorkspaceIdAndTeamIdAndStatus(
          {
            workspaceId: sprint.workspaceId,
            teamId: sprint.teamId,
            status: SprintStatus.ACTIVE,
          },
          options
        )
        if (active)
          throw new SprintStartFailedException(
            'The team already has an active sprint.'
          )
        for (const assignment of changedAssignments) {
          const row = assignment.toSnapshot()
          if (!row.current) continue
          const item = snapshot.current.get(row.workItemId)!
          if (item.deleted)
            assignment.close(
              SprintAssignmentState.DELETED,
              input.actorId,
              at,
              item,
              'Work item deleted before sprint start'
            )
          else assignment.commit(item)
        }
        sprint.recordCommitment(
          measureSprintItems(
            [...snapshot.current.values()].filter((item) => !item.deleted)
          )
        )
        sprint.start(at, UserId.create(input.actorId))
      } else {
        const outcome = this.snapshots.outcome(
          snapshot,
          input.action === 'complete',
          sprint.startedAt,
          input.action === 'cancel'
        )
        let target: typeof sprint | null = null
        if (input.action === 'complete' && outcome.rolledOver.items > 0) {
          if (!input.targetSprintId || input.targetSprintId === input.sprintId)
            throw new SprintValidationException(
              'Select the next planned sprint before completing unfinished work.'
            )
          target = await this.context.resolve(
            { ...input, sprintId: input.targetSprintId },
            'lead',
            options
          )
          if (!target.isPlanned || target.startDate <= sprint.startDate)
            throw new SprintValidationException(
              'The rollover target must be a later planned sprint in the same team.'
            )
        }
        sprint.recordOutcome(outcome)
        if (input.action === 'complete')
          sprint.complete(at, UserId.create(input.actorId))
        else sprint.cancel(UserId.create(input.actorId), at, input.reason)
        const rolled: SprintWorkItem[] = []
        for (const assignment of changedAssignments) {
          const row = assignment.toSnapshot()
          if (!row.current) continue
          const item = snapshot.current.get(row.workItemId)!
          const rollover =
            input.action === 'complete' &&
            !item.deleted &&
            item.status !== 'done' &&
            item.status !== 'cancelled'
          const state = item.deleted
            ? SprintAssignmentState.DELETED
            : rollover
              ? SprintAssignmentState.ROLLED_OVER
              : item.status === 'done'
                ? SprintAssignmentState.COMPLETED
                : SprintAssignmentState.CANCELLED
          const reason = rollover
            ? (input.reason ?? 'Unfinished at sprint completion')
            : input.reason
          assignment.close(
            state,
            input.actorId,
            at,
            item,
            reason,
            rollover ? target!.id.value : undefined
          )
          if (rollover)
            rolled.push(
              SprintWorkItem.assign({
                id: UuidUtil.generate(),
                workspaceId: sprint.workspaceId.value,
                teamId: sprint.teamId.value,
                sprintId: target!.id.value,
                addedBy: input.actorId,
                addedDuringActive: false,
                snapshot: item,
                at,
                previous: row,
                rollover: true,
                reason,
              })
            )
        }
        // Touch both sprints to serialize rollover with concurrent scope changes.
        if (target) await this.sprints.update(target, options)
        await this.assignments.saveMany(changedAssignments, options)
        await this.assignments.saveMany(rolled, options)
      }
      await this.sprints.update(sprint, options)
      if (input.action === 'start')
        await this.assignments.saveMany(changedAssignments, options)
      const result = await this.queries.findByWorkspaceIdAndTeamIdAndId(
        scope,
        options
      )
      if (!result) throw new SprintNotFoundException()
      return { sprint: result }
    })
  }
}
