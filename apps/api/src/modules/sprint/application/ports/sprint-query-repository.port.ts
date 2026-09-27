import { ITransactionOptions } from '@/shared/application'

import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '@/modules/team/domain'

import { SprintStatus } from '../../domain/enums/sprint-status.enum'
import { SprintId } from '../../domain/value-objects/sprint-id.vo'
import { SprintListItemOutput } from '../contracts/sprint-list-item.output'

export type SprintQuerySortField =
  'name' | 'startDate' | 'endDate' | 'status' | 'createdAt' | 'updatedAt'

export type QuerySortOrder = 'asc' | 'desc'

/**
 * Pagination options for sprint list queries.
 */
export interface SprintPaginationProps {
  page: number
  limit: number
}

/**
 * Sorting options for sprint list queries.
 */
export interface SprintSortProps {
  field: SprintQuerySortField
  order: QuerySortOrder
}

/**
 * Filters supported by the sprint query repository.
 */
export interface SprintQueryFilterProps {
  teamId?: TeamId

  status?: SprintStatus
  statuses?: SprintStatus[]

  search?: string

  startDateFrom?: Date
  startDateTo?: Date

  endDateFrom?: Date
  endDateTo?: Date
}

/**
 * Query parameters for retrieving a paginated sprint list.
 *
 * This contract is optimized for read operations and may be
 * extended independently from the Sprint domain aggregate.
 */
export interface FindSprintsQueryProps {
  workspaceId: WorkspaceId

  filters?: SprintQueryFilterProps
  pagination: SprintPaginationProps
  sort?: SprintSortProps
}

/**
 * Query parameters for retrieving a specific sprint.
 */
export interface FindSprintByWorkspaceIdAndTeamIdAndIdQueryProps {
  workspaceId: WorkspaceId
  teamId: TeamId
  sprintId: SprintId
}

/**
 * Paginated sprint query result.
 */
export interface SprintListQueryResult {
  items: SprintListItemOutput[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}

/**
 * Read-side repository for optimized sprint queries.
 *
 * This repository is independent from the Sprint aggregate repository
 * and is responsible for efficient read models, filtering, sorting,
 * pagination, and data enrichment.
 */
export interface SprintQueryRepository {
  findMany(
    props: FindSprintsQueryProps,
    options?: ITransactionOptions
  ): Promise<SprintListQueryResult>

  findByWorkspaceIdAndTeamIdAndId(
    props: FindSprintByWorkspaceIdAndTeamIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<SprintListItemOutput | null>
}

export const SPRINT_QUERY_REPOSITORY = Symbol('SprintQueryRepository')
