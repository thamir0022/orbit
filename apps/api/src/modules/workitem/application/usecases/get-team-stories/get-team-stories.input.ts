import type { WorkItemPriority } from '../../../domain/enums/work-item-priority.enum'
import type { WorkItemStatus } from '../../../domain/enums/work-item-status.enum'
import type { WorkItemQuerySortField } from '../../ports/work-item-query-repository.port'

export interface GetTeamStoriesInput {
  readonly workspaceId: string
  readonly teamKey: string
  readonly page: number
  readonly limit: number
  readonly search?: string
  readonly statuses?: WorkItemStatus[]
  readonly priorities?: WorkItemPriority[]
  readonly assigneeId?: string
  readonly sortField?: WorkItemQuerySortField
  readonly sortOrder?: 'asc' | 'desc'
}
