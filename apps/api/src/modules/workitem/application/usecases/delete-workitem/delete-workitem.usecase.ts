import { Inject, Injectable } from '@nestjs/common'

import { WorkspaceId } from '@/modules/workspace/domain'

import {
  WORK_ITEM_REPOSITORY,
  WorkItemRepository,
} from '../../ports/work-item-repository.port'
import { WorkItemKey } from '../../../domain/value-objects/work-item-key.vo'
import { WorkItemNotFoundException } from '../../../domain/exceptions'

import { DeleteWorkItemInput } from './delete-workitem.input'
import { IDeleteWorkItemUseCase } from './delete-workitem.interface'

/**
 * Soft deletes a work item through its domain aggregate.
 *
 * The use case resolves the aggregate, delegates deletion to the domain,
 * and persists the resulting state.
 */
@Injectable()
export class DeleteWorkItemUseCase implements IDeleteWorkItemUseCase {
  constructor(
    @Inject(WORK_ITEM_REPOSITORY)
    private readonly workItemRepository: WorkItemRepository
  ) {}

  async execute(input: DeleteWorkItemInput): Promise<void> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const key = WorkItemKey.create(input.key)

    const workItem = await this.workItemRepository.findByWorkspaceIdAndKey({
      workspaceId,
      key: key.value,
    })

    if (!workItem) {
      throw new WorkItemNotFoundException()
    }

    workItem.delete()

    await this.workItemRepository.save(workItem)
  }
}
