import { ProjectType } from '../../../domain/enums/project-type.enum'
import { ProjectPriority } from '../../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../../domain/enums/project-stage.enum'

export interface CreateProjectInput {
  readonly workspaceId: string
  readonly name: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly startDate?: Date
  readonly targetEndDate?: Date
  readonly type?: ProjectType
  readonly stage?: ProjectStage
  readonly priority?: ProjectPriority
  readonly leadId?: string
  readonly actorId: string
}
