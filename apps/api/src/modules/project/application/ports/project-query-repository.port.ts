import { ITransactionOptions } from '@/shared/application'

import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { ProjectPriority } from '../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../domain/enums/project-stage.enum'
import { ProjectStatus } from '../../domain/enums/project-status.enum'
import { ProjectType } from '../../domain/enums/project-type.enum'
import { ProjectId } from '../../domain/value-objects/project-id.vo'
import { ProjectListItemOutput } from '../contracts/project-list-item.output'

export type ProjectQuerySortField =
  | 'name'
  | 'key'
  | 'type'
  | 'stage'
  | 'priority'
  | 'status'
  | 'startDate'
  | 'targetEndDate'
  | 'createdAt'
  | 'updatedAt'

export type QuerySortOrder = 'asc' | 'desc'

/**
 * Pagination options for project list queries.
 */
export interface ProjectPaginationProps {
  page: number
  limit: number
}

/**
 * Sorting options for project list queries.
 */
export interface ProjectSortProps {
  field: ProjectQuerySortField
  order: QuerySortOrder
}

/**
 * Filters supported by the project query repository.
 */
export interface ProjectQueryFilterProps {
  type?: ProjectType
  types?: ProjectType[]

  stage?: ProjectStage
  stages?: ProjectStage[]

  priority?: ProjectPriority
  priorities?: ProjectPriority[]

  status?: ProjectStatus
  statuses?: ProjectStatus[]

  leadId?: UserId

  search?: string

  startDateFrom?: Date
  startDateTo?: Date

  targetEndDateFrom?: Date
  targetEndDateTo?: Date
}

/**
 * Query parameters for retrieving a paginated project list.
 *
 * This contract is optimized for read operations and may evolve
 * independently from the Project domain aggregate.
 */
export interface FindProjectsQueryProps {
  workspaceId: WorkspaceId

  filters?: ProjectQueryFilterProps
  pagination: ProjectPaginationProps
  sort?: ProjectSortProps
}

/**
 * Query parameters for retrieving a specific project.
 */
export interface FindProjectByWorkspaceIdAndIdQueryProps {
  workspaceId: WorkspaceId
  projectId: ProjectId
}

/**
 * Paginated project query result.
 */
export interface ProjectListQueryResult {
  items: ProjectListItemOutput[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}

/**
 * Read-side repository for optimized project queries.
 *
 * This repository is responsible for efficient read models,
 * filtering, sorting, pagination, and data enrichment.
 */
export interface ProjectQueryRepository {
  findMany(
    props: FindProjectsQueryProps,
    options?: ITransactionOptions
  ): Promise<ProjectListQueryResult>

  findByWorkspaceIdAndId(
    props: FindProjectByWorkspaceIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<ProjectListItemOutput | null>
}

export const PROJECT_QUERY_REPOSITORY = Symbol('ProjectQueryRepository')
