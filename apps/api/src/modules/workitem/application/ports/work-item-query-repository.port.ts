import { ITransactionOptions } from '@/shared/application'

import { ProjectId } from '@/modules/project/domain'
import { SprintId } from '@/modules/sprint/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { WorkItemPriority } from '../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../domain/enums/work-item-type.enum'
import { WorkItemId } from '../../domain/value-objects/work-item-id.vo'
import { WorkItemListItemOutput } from '../contracts/work-item-list-item.output'

export type WorkItemQuerySortField =
  | 'key'
  | 'number'
  | 'title'
  | 'type'
  | 'status'
  | 'priority'
  | 'storyPoints'
  | 'dueDate'
  | 'createdAt'
  | 'updatedAt'

export type QuerySortOrder = 'asc' | 'desc'

/**
 * Pagination options for work item list queries.
 */
export interface WorkItemPaginationProps {
  readonly page: number
  readonly limit: number
}

/**
 * Sorting options for work item list queries.
 */
export interface WorkItemSortProps {
  readonly field: WorkItemQuerySortField
  readonly order: QuerySortOrder
}

/**
 * Filters supported by the work item query repository.
 */
export interface WorkItemQueryFilterProps {
  readonly projectId?: ProjectId
  readonly teamId?: TeamId
  readonly sprintId?: SprintId
  readonly assigneeId?: UserId
  readonly parentId?: WorkItemId

  readonly type?: WorkItemType
  readonly types?: WorkItemType[]

  readonly status?: WorkItemStatus
  readonly statuses?: WorkItemStatus[]

  readonly priority?: WorkItemPriority
  readonly priorities?: WorkItemPriority[]

  readonly search?: string

  readonly storyPointsFrom?: number
  readonly storyPointsTo?: number

  readonly startDateFrom?: Date
  readonly startDateTo?: Date

  readonly dueDateFrom?: Date
  readonly dueDateTo?: Date

  readonly completedDateFrom?: Date
  readonly completedDateTo?: Date
}

/**
 * Query parameters for retrieving a paginated work item list.
 *
 * This contract is optimized for read operations and can evolve
 * independently from the WorkItem domain aggregate.
 */
export interface FindWorkItemsQueryProps {
  readonly workspaceId: WorkspaceId

  readonly filters?: WorkItemQueryFilterProps
  readonly pagination: WorkItemPaginationProps
  readonly sort?: WorkItemSortProps
}

/**
 * Query parameters for retrieving a specific work item.
 */
export interface FindWorkItemByWorkspaceIdAndProjectIdAndIdQueryProps {
  readonly workspaceId: WorkspaceId
  readonly projectId: ProjectId
  readonly workItemId: WorkItemId
}

/**
 * Paginated work item query result.
 */
export interface WorkItemListQueryResult {
  readonly items: WorkItemListItemOutput[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly hasNextPage: boolean
}

/**
 * Read-side repository for optimized work item queries.
 *
 * This repository is independent from the WorkItem aggregate repository
 * and is responsible for efficient filtering, sorting, pagination,
 * and read-model construction.
 */
export interface WorkItemQueryRepository {
  findMany(
    props: FindWorkItemsQueryProps,
    options?: ITransactionOptions
  ): Promise<WorkItemListQueryResult>

  findByWorkspaceIdAndProjectIdAndId(
    props: FindWorkItemByWorkspaceIdAndProjectIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<WorkItemListItemOutput | null>
}

export const WORK_ITEM_QUERY_REPOSITORY = Symbol('WorkItemQueryRepository')
