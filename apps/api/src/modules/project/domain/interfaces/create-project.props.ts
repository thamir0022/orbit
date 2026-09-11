import { WorkspaceId } from '@/modules/workspace/domain'
import {
  ProjectAvatar,
  ProjectDescription,
  ProjectKey,
  ProjectName,
  ProjectResource,
} from '../value-objects'
import { ProjectPriority, ProjectType } from '../enums'
import { UserId } from '@/modules/user/domain'

export interface CreateProjectProps {
  workspaceId: WorkspaceId

  name: ProjectName

  key: ProjectKey

  description?: ProjectDescription

  resources?: ProjectResource[]

  avatar?: ProjectAvatar

  startDate?: Date

  targetEndDate?: Date

  type?: ProjectType

  priority?: ProjectPriority

  leadId?: UserId

  createdBy: UserId
}
