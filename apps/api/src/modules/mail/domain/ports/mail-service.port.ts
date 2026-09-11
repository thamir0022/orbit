export interface WorkspaceInvitationEmailPayload {
  inviterName: string
  workspaceName: string
  roleName: string
  invitationUrl: string
  expiresInDays: number
}
export interface IMailService {
  sendForgotPasswordEmail(to: string, otp: string): Promise<void>
  sendEmailVerificationEmail(to: string, otp: string): Promise<void>
  sendWorkspaceInvitationEmail(
    to: string,
    payload: WorkspaceInvitationEmailPayload
  ): Promise<void>
}

export const MAIL_SERVICE = Symbol('MAIL_SERVICE')
