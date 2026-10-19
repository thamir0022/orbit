import { UserSummary } from '@/shared/types/user-summary'

export interface Team {
  readonly key: string
  readonly workspaceId: string
  readonly name: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly lead: UserSummary
  readonly status: TeamStatus
  readonly createdBy: UserSummary
  readonly createdAt: string
  readonly updatedAt: string
}

export enum TeamStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export interface TeamSummary {
  readonly key: string
  readonly name: string
  readonly avatarUrl?: string
}
