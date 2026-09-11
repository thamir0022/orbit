export enum WorkspaceInvitationAction {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
}

export interface GetWorkspaceInvitationOutput {
  workspaceName: string

  workspaceSlug: string

  workspaceLogoUrl?: string

  inviterName: string

  roleName: string

  expiresAt: Date

  action: WorkspaceInvitationAction
}
