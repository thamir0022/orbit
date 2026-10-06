export enum ProjectType {
  PRODUCT = 'product',
  CLIENT = 'client',
  INTERNAL = 'internal',
  PLATFORM = 'platform',
  INFRASTRUCTURE = 'infrastructure',
  EXPERIMENT = 'experiment',
  RESEARCH = 'research',
  OTHER = 'other',
}

export enum ProjectStage {
  IDEA = 'idea',
  DISCOVERY = 'discovery',
  PROPOSAL = 'proposal',
  APPROVED = 'approved',
  READY = 'ready',
  DELIVERY = 'delivery',
  MAINTENANCE = 'maintenance',
}

export enum ProjectPriority {
  NO_PRIORITY = 'no-priority',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ProjectStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  ARCHIVED = 'archived',
}

export interface ProjectLead {
  readonly id: string
  readonly displayName: string
  readonly avatarUrl?: string | null
}

export interface Project {
  readonly id: string
  readonly name: string
  readonly key: string

  readonly description?: string
  readonly avatarUrl?: string | null
  readonly type: ProjectType
  readonly stage: ProjectStage
  readonly priority: ProjectPriority
  readonly status: ProjectStatus

  readonly createdBy: ProjectLead

  readonly lead?: ProjectLead | null

  readonly startDate?: string | null
  readonly targetEndDate?: string | null

  readonly createdAt: string
  readonly updatedAt: string
}

export interface ProjectPagination {
  readonly page: number
  readonly limit: number
  readonly total: number
  readonly totalPages: number
}

export interface GetProjectsResponse {
  readonly projects: Project[]
  readonly pagination: ProjectPagination
}

export interface UpdateProjectInput {
  workspaceId: string
  key: string

  name?: string
  description?: string
  avatarUrl?: string

  type?: ProjectType
  stage?: ProjectStage
  priority?: ProjectPriority
  status?: ProjectStatus

  leadId?: string | null

  startDate?: Date | null
  targetEndDate?: Date | null
}
