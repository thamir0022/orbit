import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'
import { ProjectId } from '../value-objects/project-id.vo'
import { ProjectKey } from '../value-objects/project-key.vo'
import { ProjectType } from '../enums/project-type.enum'
import { ProjectPriority } from '../enums/project-priority.enum'
import { ProjectStatus } from '../enums/project-status.enum'
import { ProjectStage } from '../enums/project-stage.enum'

export interface ProjectProps {
  readonly id: ProjectId
  readonly workspaceId: WorkspaceId
  readonly name: string
  readonly key: ProjectKey
  readonly description?: string
  readonly avatarUrl?: string
  readonly startDate?: Date
  readonly targetEndDate?: Date
  readonly type: ProjectType
  readonly stage: ProjectStage
  readonly priority: ProjectPriority
  readonly leadId?: UserId
  readonly status: ProjectStatus
  readonly createdBy: UserId
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
  readonly deletedBy: UserId | null
}
