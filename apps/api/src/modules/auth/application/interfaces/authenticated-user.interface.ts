export interface AuthenticatedUser {
  id: string
  sessionId?: string
  jti?: string
  ip?: string
}
