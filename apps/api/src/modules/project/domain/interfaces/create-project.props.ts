import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'
import { ProjectKey } from '../value-objects/project-key.vo'
import { ProjectType } from '../enums/project-type.enum'
import { ProjectPriority } from '../enums/project-priority.enum'
import { ProjectStage } from '../enums/project-stage.enum'

export interface CreateProjectProps {
  readonly workspaceId: WorkspaceId
  readonly name: string
  readonly key: ProjectKey
  readonly description?: string
  readonly avatarUrl?: string
  readonly startDate?: Date
  readonly targetEndDate?: Date
  readonly type?: ProjectType
  readonly stage?: ProjectStage
  readonly priority?: ProjectPriority
  readonly leadId?: UserId
  readonly createdBy: UserId
}
