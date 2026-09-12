export type WorkspaceInvitationStatus =
  'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

export interface WorkspaceInvitation {
  id: string
  workspaceId: string
  email: string
  roleId: string
  invitedBy: string
  status: WorkspaceInvitationStatus
  expiresAt: string
  acceptedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateWorkspaceInvitationInput {
  email: string
  roleId: string
}

export interface CreateWorkspaceInvitationResponse {
  invitationId: string
  email: string
  expiresAt: Date
}
