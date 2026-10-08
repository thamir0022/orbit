export interface Team {
  readonly id: string
  readonly workspaceId: string
  readonly name: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly leadId: string | null
  readonly status: TeamStatus
  readonly createdBy: string
  readonly createdAt: string
  readonly updatedAt: string
}

export enum TeamStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}
