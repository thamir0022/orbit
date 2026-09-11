// src/entities/project/model/types.ts
export const PROJECT_STATUSES = [
  'planned',
  'active',
  'on_hold',
  'completed',
  'cancelled',
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number]

export const PROJECT_TYPES = [
  'internal',
  'client',
  'research',
  'maintenance',
] as const

export type ProjectType = (typeof PROJECT_TYPES)[number]

export interface ProjectResource {
  name: string
  url: string
}

export interface Project {
  id: string
  workspaceId: string
  name: string
  key: string
  description?: string | null
  resources: ProjectResource[]
  avatarUrl?: string | null
  startDate?: string | null
  targetEndDate?: string | null
  type?: ProjectType | null
  priority: ProjectPriority
  leadId?: string | null
  status: ProjectStatus
  progress: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  key: string
  description?: string
  resources?: ProjectResource[]
  avatarUrl?: string
  startDate?: string
  targetEndDate?: string
  type?: ProjectType
  priority?: ProjectPriority
  leadId?: string
}

export interface GetWorkspaceProjectsParams {
  search?: string
  status?: ProjectStatus | 'all'
  priority?: ProjectPriority | 'all'
  type?: ProjectType | 'all'
  page?: number
  limit?: number
}

export interface GetWorkspaceProjectsResponse {
  projects: Project[]
}

export interface CreateProjectResponse {
  project: Project
}

export const PROJECT_STATUS_OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'ready', label: 'Ready' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
] as const

export const PROJECT_PRIORITY_OPTIONS = [
  { value: 'no-priority', label: 'No Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

export const PROJECT_TYPE_OPTIONS = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'full-stack', label: 'Full Stack' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'api', label: 'API' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data' },
  { value: 'ai', label: 'AI / Machine Learning' },
  { value: 'product', label: 'Product' },
  { value: 'other', label: 'Other' },
] as const
