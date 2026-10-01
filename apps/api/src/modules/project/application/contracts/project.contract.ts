import { ProjectPriority } from '../../domain/enums/project-priority.enum'
import { ProjectStatus } from '../../domain/enums/project-status.enum'
import { ProjectType } from '../../domain/enums/project-type.enum'

export interface ProjectContract {
  id: string
  workspaceId: string
  name: string
  key: string
  description?: string
  avatarUrl?: string
  startDate?: Date
  targetEndDate?: Date
  type: ProjectType
  priority: ProjectPriority
  leadId?: string
  status: ProjectStatus
  progress: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
