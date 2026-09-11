import { WorkspaceId } from '@/modules/workspace/domain'
import {
  ProjectAvatar,
  ProjectDescription,
  ProjectId,
  ProjectKey,
  ProjectName,
  ProjectProgress,
  ProjectResource,
} from '../value-objects'
import { ProjectPriority, ProjectStatus, ProjectType } from '../enums'
import { UserId } from '@/modules/user/domain'

export interface ProjectProps {
  id: ProjectId

  workspaceId: WorkspaceId

  name: ProjectName

  key: ProjectKey

  description?: ProjectDescription

  resources?: ProjectResource[]

  avatar?: ProjectAvatar

  startDate?: Date

  targetEndDate?: Date

  type?: ProjectType

  priority: ProjectPriority

  leadId?: UserId

  status: ProjectStatus

  progress: ProjectProgress

  createdBy: UserId

  createdAt: Date

  updatedAt: Date
}
