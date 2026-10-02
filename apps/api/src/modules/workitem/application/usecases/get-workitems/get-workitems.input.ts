import {
  QuerySortOrder,
  WorkItemQuerySortField,
} from '../../ports/work-item-query-repository.port'

import { WorkItemPriority } from '../../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../../domain/enums/work-item-type.enum'

/**
 * Input for retrieving work items within a workspace.
 *
 * Values remain primitive at the application boundary.
 * Domain value objects are created inside the use case.
 */
export interface GetWorkItemsInput {
  readonly workspaceId: string

  readonly projectId?: string

  readonly teamId?: string

  readonly sprintId?: string

  readonly assigneeId?: string

  readonly parentId?: string

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

  readonly page?: number

  readonly limit?: number

  readonly sortField?: WorkItemQuerySortField

  readonly sortOrder?: QuerySortOrder
}
