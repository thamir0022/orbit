import { WorkspaceMemberStatus } from '@/modules/workspace/domain'

export interface UpdateWorkspaceMemberInput {
  readonly workspaceId: string
  readonly memberId: string
  readonly status?: WorkspaceMemberStatus
  readonly roleId?: string
}
