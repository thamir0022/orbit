import { PaginationMeta } from '@/shared/application'
import { WorkspaceMemberDto } from '../../model/workspace-member'

export interface GetWorkspaceMembersOutput {
  readonly workspaceMembers: WorkspaceMemberDto[]

  readonly meta: PaginationMeta
}
