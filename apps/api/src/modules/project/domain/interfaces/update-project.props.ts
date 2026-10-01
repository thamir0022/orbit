import { UserId } from '@/modules/user/domain'
import { ProjectPriority } from '../enums/project-priority.enum'
import { ProjectStage } from '../enums/project-stage.enum'
import { ProjectStatus } from '../enums/project-status.enum'
import { ProjectType } from '../enums/project-type.enum'

/**
 * Update method props
 */
export interface UpdateProjectProps {
  readonly type: ProjectType
  readonly stage: ProjectStage
  readonly priority: ProjectPriority
  readonly status: ProjectStatus
  readonly leadId: UserId
  readonly startDate: Date
  readonly targetEndDate: Date
}
