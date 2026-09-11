export interface IWorkspaceInvitationService {
  generateToken(): string

  hashToken(token: string): string

  buildInvitationUrl(token: string): string

  verifyToken(rawToken: string, storedHash: string): boolean
}

export const WORKSPACE_INVITATION_SERVICE = Symbol(
  'IWorkspaceInvitationService'
)
