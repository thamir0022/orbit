import { WorkspaceInvitationAction } from '../../../application/dtos'

export class GetWorkspaceInvitationResponse {
  workspaceName!: string
  workspaceSlug!: string
  workspaceLogoUrl?: string
  inviterName!: string
  roleName!: string
  expiresAt!: Date
  action!: WorkspaceInvitationAction
}
