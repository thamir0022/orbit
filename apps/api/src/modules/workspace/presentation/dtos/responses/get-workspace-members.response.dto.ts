import { WorkspaceMemberDto } from '@/modules/workspace/application/model/workspace-member'
import { PaginationMeta } from '@/shared/application'

export class GetWorkspaceMembersReponse {
  workspaceMembers!: WorkspaceMemberDto[]
  meta!: PaginationMeta
}
