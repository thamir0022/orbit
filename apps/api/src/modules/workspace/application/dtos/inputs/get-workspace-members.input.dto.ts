import { WorkspaceMemberStatus } from '@/modules/workspace/domain'

export interface GetWorkspaceMembersInput {
  readonly workspaceId: string

  readonly page: number

  readonly limit: number

  readonly search?: string

  readonly roleId?: string

  readonly status?: WorkspaceMemberStatus
}
