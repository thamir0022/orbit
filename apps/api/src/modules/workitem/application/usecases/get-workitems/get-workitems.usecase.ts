import { Inject, Injectable } from '@nestjs/common'

import { ProjectId } from '@/modules/project/domain'
import { SprintId } from '@/modules/sprint/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkItemId } from '../../../domain/value-objects/work-item-id.vo'
import { WorkspaceId } from '@/modules/workspace/domain'

import {
  WORK_ITEM_QUERY_REPOSITORY,
  WorkItemQueryRepository,
} from '../../ports/work-item-query-repository.port'

import { GetWorkItemsInput } from './get-workitems.input'
import { GetWorkItemsOutput } from './get-workitems.output'
import { IGetWorkItemsUseCase } from './get-workitems.interface'

/**
 * Retrieves work items using the optimized query-side repository.
 *
 * The use case translates application input into query parameters.
 * Filtering, sorting, pagination, and read optimization remain inside
 * the query repository.
 */
@Injectable()
export class GetWorkItemsUseCase implements IGetWorkItemsUseCase {
  constructor(
    @Inject(WORK_ITEM_QUERY_REPOSITORY)
    private readonly workItemQueryRepository: WorkItemQueryRepository
  ) {}

  async execute(input: GetWorkItemsInput): Promise<GetWorkItemsOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const projectId = input.projectId
      ? ProjectId.create(input.projectId)
      : undefined

    const teamId = input.teamId ? TeamId.create(input.teamId) : undefined

    const sprintId = input.sprintId
      ? SprintId.create(input.sprintId)
      : undefined

    const assigneeId = input.assigneeId
      ? UserId.create(input.assigneeId)
      : undefined

    const parentId = input.parentId
      ? WorkItemId.create(input.parentId)
      : undefined

    const result = await this.workItemQueryRepository.findMany({
      workspaceId,

      filters: {
        projectId,
        teamId,
        sprintId,
        assigneeId,
        parentId,

        type: input.type,
        types: input.types,

        status: input.status,
        statuses: input.statuses,

        priority: input.priority,
        priorities: input.priorities,

        search: input.search || undefined,

        storyPointsFrom: input.storyPointsFrom,
        storyPointsTo: input.storyPointsTo,

        startDateFrom: input.startDateFrom,
        startDateTo: input.startDateTo,

        dueDateFrom: input.dueDateFrom,
        dueDateTo: input.dueDateTo,

        completedDateFrom: input.completedDateFrom,
        completedDateTo: input.completedDateTo,
      },

      pagination: {
        page: input.page ?? 1,
        limit: input.limit ?? 20,
      },

      sort: input.sortField
        ? {
            field: input.sortField,
            order: input.sortOrder ?? 'desc',
          }
        : undefined,
    })

    return {
      workItems: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
    }
  }
}
