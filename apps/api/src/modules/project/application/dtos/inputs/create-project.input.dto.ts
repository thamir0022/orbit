import { ProjectPriority, ProjectType } from '@/modules/project/domain/enums'
import { ProjectResourceDto } from '../../model/project.dto'

export interface CreateProjectInput {
  readonly workspaceId: string

  readonly name: string

  readonly key: string

  readonly description?: string

  readonly resources?: ProjectResourceDto[]

  readonly avatarUrl?: string

  readonly startDate?: Date

  readonly targetEndDate?: Date

  readonly type?: ProjectType

  readonly priority?: ProjectPriority

  readonly leadId?: string

  readonly createdBy: string
}
