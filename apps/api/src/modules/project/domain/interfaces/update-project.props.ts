import { UserId } from '@/modules/user/domain'
import { ProjectPriority } from '../enums/project-priority.enum'
import { ProjectStage } from '../enums/project-stage.enum'
import { ProjectStatus } from '../enums/project-status.enum'
import { ProjectType } from '../enums/project-type.enum'

/**
 * Update method props
 */
export interface UpdateProjectProps {
  // Project metadata
  readonly name?: string
  readonly description?: string
  readonly avatarUrl?: string

  // Project classification
  readonly type?: ProjectType
  readonly stage?: ProjectStage
  readonly priority?: ProjectPriority

  // Project ownership
  readonly leadId?: UserId | null

  // Project lifecycle
  readonly status?: ProjectStatus
  readonly startDate?: Date | null
  readonly targetEndDate?: Date | null
}
