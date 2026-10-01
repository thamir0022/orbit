import { ProjectPriority } from '../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../domain/enums/project-stage.enum'
import { ProjectStatus } from '../../domain/enums/project-status.enum'
import { ProjectType } from '../../domain/enums/project-type.enum'

/**
 * Application layer project contract
 */
export interface ProjectContract {
  readonly id: string
  readonly workspaceId: string

  readonly name: string
  readonly key: string

  readonly description?: string
  readonly avatarUrl?: string

  readonly type: ProjectType
  readonly stage: ProjectStage
  readonly priority: ProjectPriority

  readonly leadId?: string

  readonly status: ProjectStatus
  readonly startDate?: Date
  readonly targetEndDate?: Date

  readonly createdBy: string
  readonly createdAt: Date
  readonly updatedAt: Date

  readonly deletedAt: Date | null
  readonly deletedBy: string | null
}
