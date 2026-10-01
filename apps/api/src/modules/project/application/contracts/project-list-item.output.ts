import { UserSummaryOutput } from '@/shared/application/contracts'

import { ProjectPriority } from '../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../domain/enums/project-stage.enum'
import { ProjectStatus } from '../../domain/enums/project-status.enum'
import { ProjectType } from '../../domain/enums/project-type.enum'

/**
 * Read-optimized representation of a project for list views.
 *
 * This output may contain enriched data returned by dedicated
 * query repositories and does not need to mirror the domain entity.
 */
export interface ProjectListItemOutput {
  id: string

  name: string
  key: string

  description?: string
  avatarUrl?: string

  type: ProjectType
  stage: ProjectStage
  priority: ProjectPriority
  status: ProjectStatus

  lead: UserSummaryOutput | null
  createdBy: UserSummaryOutput

  startDate: Date | null
  targetEndDate: Date | null

  createdAt: Date
  updatedAt: Date
}
