import { Inject, Injectable } from '@nestjs/common'

import { WorkspaceId } from '@/modules/workspace/domain'

import {
  WORK_ITEM_QUERY_REPOSITORY,
  WorkItemQueryRepository,
} from '../../ports/work-item-query-repository.port'
import {
  WORK_ITEM_REPOSITORY,
  WorkItemRepository,
} from '../../ports/work-item-repository.port'
import { WorkItemNotFoundException } from '../../../domain/exceptions'
import { WorkItemKey } from '../../../domain/value-objects/work-item-key.vo'

import { IUpdateWorkItemUseCase } from './update-workitem.interface'
import { UpdateWorkItemInput } from './update-workitem.input'
import { UpdateWorkItemOutput } from './update-workitem.output'

/**
 * Updates a work item through its domain aggregate.
 *
 * The use case resolves the aggregate, delegates business rules
 * to the domain, persists the change, and returns the updated read model.
 */
@Injectable()
export class UpdateWorkItemUseCase implements IUpdateWorkItemUseCase {
  constructor(
    @Inject(WORK_ITEM_REPOSITORY)
    private readonly workItemRepository: WorkItemRepository,

    @Inject(WORK_ITEM_QUERY_REPOSITORY)
    private readonly workItemQueryRepository: WorkItemQueryRepository
  ) {}

  async execute(input: UpdateWorkItemInput): Promise<UpdateWorkItemOutput> {
    const {
      workspaceId: workspaceIdValue,
      key: keyValue,
      ...updateProps
    } = input

    const workspaceId = WorkspaceId.create(workspaceIdValue)

    const key = WorkItemKey.create(keyValue)

    const workItem = await this.workItemRepository.findByWorkspaceIdAndKey({
      workspaceId,
      key: key.value,
    })

    if (!workItem) {
      throw new WorkItemNotFoundException()
    }

    workItem.updateWorkItem(updateProps)

    await this.workItemRepository.save(workItem)

    const updatedWorkItem =
      await this.workItemQueryRepository.findByWorkspaceIdAndKey({
        workspaceId,
        key: key,
      })

    if (!updatedWorkItem) {
      throw new WorkItemNotFoundException()
    }

    return {
      workItem: updatedWorkItem,
    }
  }
}
