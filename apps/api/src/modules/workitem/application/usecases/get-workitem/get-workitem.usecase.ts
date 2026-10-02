import { Inject, Injectable } from '@nestjs/common'

import { WorkspaceId } from '@/modules/workspace/domain'

import {
  WORK_ITEM_QUERY_REPOSITORY,
  WorkItemQueryRepository,
} from '../../ports/work-item-query-repository.port'
import { WorkItemKey } from '../../../domain/value-objects/work-item-key.vo'
import { WorkItemNotFoundException } from '../../../domain/exceptions'

import { GetWorkItemInput } from './get-workitem.input'
import { GetWorkItemOutput } from './get-workitem.output'
import { IGetWorkItemUseCase } from './get-workitem.interface'

/**
 * Retrieves a single work item using the optimized query-side repository.
 *
 * The use case translates application input into domain value objects.
 * Read optimization and data enrichment remain inside the query repository.
 */
@Injectable()
export class GetWorkItemUseCase implements IGetWorkItemUseCase {
  constructor(
    @Inject(WORK_ITEM_QUERY_REPOSITORY)
    private readonly workItemQueryRepository: WorkItemQueryRepository
  ) {}

  async execute(input: GetWorkItemInput): Promise<GetWorkItemOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const key = WorkItemKey.create(input.key)

    const workItem = await this.workItemQueryRepository.findByWorkspaceIdAndKey(
      {
        workspaceId,
        key,
      }
    )

    if (!workItem) {
      throw new WorkItemNotFoundException()
    }

    return {
      workItem,
    }
  }
}
