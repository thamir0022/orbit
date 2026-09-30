import { Inject, Injectable } from '@nestjs/common'

import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@/modules/project/application/repositories/project.repository.interface'
import { ProjectId } from '@/modules/project/domain'
import { ProjectNotFoundException } from '@/modules/project/domain/exceptions'
import { WorkspaceId } from '@/modules/workspace/domain'

import { WorkItem } from '../../../domain/entities/work-item.entity'
import { WorkItemKey } from '../../../domain/value-objects/work-item-key.vo'
import { WorkItemNotFoundException } from '../../../domain/exceptions'

import {
  WORK_ITEM_COUNTER_REPOSITORY,
  WorkItemCounterRepository,
} from '../../ports/work-item-counter-repository.port'
import {
  WORK_ITEM_QUERY_REPOSITORY,
  WorkItemQueryRepository,
} from '../../ports/work-item-query-repository.port'
import {
  WORK_ITEM_REPOSITORY,
  WorkItemRepository,
} from '../../ports/work-item-repository.port'

import { CreateWorkItemInput } from './create-work-item.input'
import { ICreateWorkItemUseCase } from './create-work-item.interface'
import { CreateWorkItemOutput } from './create-work-item.output'

import {
  ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application/ports/transaction-manager.interface'

@Injectable()
export class CreateWorkItemUseCase implements ICreateWorkItemUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,

    @Inject(WORK_ITEM_COUNTER_REPOSITORY)
    private readonly workItemCounterRepository: WorkItemCounterRepository,

    @Inject(WORK_ITEM_REPOSITORY)
    private readonly workItemRepository: WorkItemRepository,

    @Inject(WORK_ITEM_QUERY_REPOSITORY)
    private readonly workItemQueryRepository: WorkItemQueryRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: CreateWorkItemInput): Promise<CreateWorkItemOutput> {
    const { workspaceId: workspaceIdValue, ...workItemProps } = input

    const workspaceId = WorkspaceId.create(workspaceIdValue)
    const projectId = ProjectId.create(input.projectId)

    const project = await this.projectRepository.findById(projectId)

    if (!project) throw new ProjectNotFoundException()

    const workItem = await this.transactionManager.executeTransaction(
      async (session) => {
        const number = await this.workItemCounterRepository.nextNumber(
          projectId,
          { session }
        )

        const key = WorkItemKey.generate(project.key, number)

        const workItem = WorkItem.create({
          ...workItemProps,

          workspaceId: workspaceId.value,

          key,
          number,

          createdBy: input.actorId,
        })

        await this.workItemRepository.save(workItem, { session })

        return workItem
      }
    )

    const result =
      await this.workItemQueryRepository.findByWorkspaceIdAndProjectIdAndId({
        workspaceId: workItem.workspaceId,
        projectId: workItem.projectId,
        workItemId: workItem.id,
      })

    if (!result) throw new WorkItemNotFoundException()

    return {
      workItem: result,
    }
  }
}
