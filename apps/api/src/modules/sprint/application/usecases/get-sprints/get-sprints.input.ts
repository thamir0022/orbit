import {
  QuerySortOrder,
  SprintQuerySortField,
} from '../../ports/sprint-query-repository.port'
import { SprintStatus } from '../../../domain/enums/sprint-status.enum'

/**
 * Input for retrieving sprints within a workspace.
 *
 * Values remain primitive at the application boundary.
 * Domain value objects are created inside the use case.
 */
export interface GetSprintsInput {
  readonly workspaceId: string

  readonly teamId?: string

  readonly status?: SprintStatus
  readonly statuses?: SprintStatus[]

  readonly search?: string

  readonly startDateFrom?: Date | string
  readonly startDateTo?: Date | string

  readonly endDateFrom?: Date | string
  readonly endDateTo?: Date | string

  readonly page?: number
  readonly limit?: number

  readonly sortField?: SprintQuerySortField
  readonly sortOrder?: QuerySortOrder
}
