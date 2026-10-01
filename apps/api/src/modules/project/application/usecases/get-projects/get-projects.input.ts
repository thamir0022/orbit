import {
  ProjectQuerySortField,
  QuerySortOrder,
} from '../../ports/project-query-repository.port'

import { ProjectPriority } from '../../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../../domain/enums/project-stage.enum'
import { ProjectStatus } from '../../../domain/enums/project-status.enum'
import { ProjectType } from '../../../domain/enums/project-type.enum'

/**
 * Input for retrieving projects within a workspace.
 *
 * Values remain primitive at the application boundary.
 * Domain value objects are created inside the use case.
 */
export interface GetProjectsInput {
  readonly workspaceId: string

  readonly type?: ProjectType
  readonly types?: ProjectType[]

  readonly stage?: ProjectStage
  readonly stages?: ProjectStage[]

  readonly priority?: ProjectPriority
  readonly priorities?: ProjectPriority[]

  readonly status?: ProjectStatus
  readonly statuses?: ProjectStatus[]

  readonly leadId?: string

  readonly search?: string

  readonly startDateFrom?: Date | string
  readonly startDateTo?: Date | string

  readonly targetEndDateFrom?: Date | string
  readonly targetEndDateTo?: Date | string

  readonly page?: number
  readonly limit?: number

  readonly sortField?: ProjectQuerySortField
  readonly sortOrder?: QuerySortOrder
}
