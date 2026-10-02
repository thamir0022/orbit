import { ProjectPriority } from '../../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../../domain/enums/project-stage.enum'
import { ProjectStatus } from '../../../domain/enums/project-status.enum'
import { ProjectType } from '../../../domain/enums/project-type.enum'

/**
 * Input for partially updating a project.
 */
export interface UpdateProjectInput {
  readonly workspaceId: string
  readonly key: string

  readonly name?: string
  readonly description?: string
  readonly avatarUrl?: string

  readonly type?: ProjectType
  readonly stage?: ProjectStage
  readonly priority?: ProjectPriority
  readonly status?: ProjectStatus

  readonly leadId?: string | null

  readonly startDate?: Date | null
  readonly targetEndDate?: Date | null
}
