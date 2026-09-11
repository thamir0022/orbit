import { ProjectPriority, ProjectStatus, ProjectType } from '../../domain/enums'

export interface ProjectDto {
  id: string

  workspaceId: string

  name: string

  key: string

  description?: string

  resources: ProjectResourceDto[]

  avatarUrl?: string

  startDate?: Date

  targetEndDate?: Date

  type?: ProjectType

  priority: ProjectPriority

  leadId?: string

  status: ProjectStatus

  progress: number

  createdBy: string

  createdAt: Date

  updatedAt: Date
}

export interface ProjectResourceDto {
  name: string

  url: string
}
