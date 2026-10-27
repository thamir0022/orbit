import { Inject, Injectable } from '@nestjs/common'

import { TeamId } from '@/modules/team/domain'
import {
  TEAM_REPOSITORY,
  TeamRepository,
} from '@/modules/team/application/ports/team-repository.port'
import { WorkspaceId } from '@/modules/workspace/domain'

import { WorkItem } from '../../../domain/entities/work-item.entity'
import { WorkItemNotFoundException } from '../../../domain/exceptions'
import { WorkItemKey } from '../../../domain/value-objects/work-item-key.vo'

import {
  WORK_ITEM_NUMBER_ALLOCATOR,
  WorkItemNumberAllocator,
} from '../../ports/work-item-number-allocator.port'
import {
  WORK_ITEM_QUERY_REPOSITORY,
  WorkItemQueryRepository,
} from '../../ports/work-item-query-repository.port'
import {
  WORK_ITEM_REPOSITORY,
  WorkItemRepository,
} from '../../ports/work-item-repository.port'

import {
  ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application/ports/transaction-manager.interface'

import { CreateWorkItemInput } from './create-work-item.input'
import { ICreateWorkItemUseCase } from './create-work-item.interface'
import { CreateWorkItemOutput } from './create-work-item.output'
import { TeamNotFoundException } from '@/modules/team/domain/exceptions'

@Injectable()
export class CreateWorkItemUseCase implements ICreateWorkItemUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,

    @Inject(WORK_ITEM_NUMBER_ALLOCATOR)
    private readonly workItemNumberAllocator: WorkItemNumberAllocator,

    @Inject(WORK_ITEM_REPOSITORY)
    private readonly workItemRepository: WorkItemRepository,

    @Inject(WORK_ITEM_QUERY_REPOSITORY)
    private readonly workItemQueryRepository: WorkItemQueryRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: CreateWorkItemInput): Promise<CreateWorkItemOutput> {
    const {
      workspaceId: workspaceIdValue,
      teamId: teamIdValue,
      ...workItemProps
    } = input

    const workspaceId = WorkspaceId.create(workspaceIdValue)
    const teamId = TeamId.create(teamIdValue)

    const team = await this.teamRepository.findByWorkspaceIdAndId(
      workspaceId,
      teamId
    )

    if (!team) {
      throw new TeamNotFoundException()
    }

    const workItem = await this.transactionManager.executeTransaction(
      async (session) => {
        const sequence = await this.workItemNumberAllocator.allocateNextNumber(
          workspaceId,
          teamId,
          { session }
        )

        const key = WorkItemKey.fromSequence(team.key.value, sequence)

        const newWorkItem = WorkItem.create({
          ...workItemProps,
          workspaceId: workspaceId.value,
          teamId: teamId.value,
          key,
          number: sequence,
          createdBy: input.actorId,
        })

        await this.workItemRepository.save(newWorkItem, { session })

        return newWorkItem
      }
    )

    const result =
      await this.workItemQueryRepository.findByWorkspaceIdAndTeamIdAndId({
        workspaceId: workItem.workspaceId,
        teamId: workItem.teamId,
        workItemId: workItem.id,
      })

    if (!result) {
      throw new WorkItemNotFoundException()
    }

    return {
      workItem: result,
    }
  }
}
