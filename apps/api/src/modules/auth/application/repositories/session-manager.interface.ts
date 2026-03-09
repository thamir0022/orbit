/**
 * Session Manager Interface (Port)
 *
 * APPLICATION LAYER port for session management operations.
 * Infrastructure provides Redis-based implementation.
 *
 * Why here?
 * - Session storage is an infrastructure concern (Redis)
 * - Application orchestrates session creation during sign-in
 * - Domain layer is unaware of session management
 */

export interface SessionData {
  userId: string
  jti: string
  email: string
  ipAddress: string
  userAgent: string
}

export interface Session extends SessionData {
  sessionId: string
  createdAt: Date
  expiresAt: Date
}

export interface UpdateSession {
  jti: string
  ipAddress: string
}

export enum SignUpStep {
  EMAIL_VERIFIED = 'email_verified',
  DETAILS_COMPLETED = 'details_completed',
}

export interface CreateSignUpSession {
  email: string
  isEmailVerified: boolean
}

export interface UpdateSignUpSessionData {
  firstName?: string
  lastName?: string
  passwordHash?: string
  currentStep: SignUpStep
}

export interface SignUpSessionData
  extends CreateSignUpSession, Partial<UpdateSignUpSessionData> {
  currentStep: SignUpStep
  createdAt: Date
  updatedAt: Date
}

export interface ISessionManager {
  createAuthSession(data: SessionData): Promise<string>
  getAuthSession(sessionId: string): Promise<Session | null>
  invalidateAuthSession(sessionId: string): Promise<void>
  invalidateAllUserSessions(userId: string): Promise<void>
  extendAuthSession(
    sessionId: string,
    updates: UpdateSession,
    expiresAt: Date
  ): Promise<void>
  blacklistToken(jti: string, expiresAt: Date): Promise<void>
  isTokenBlacklisted(jti: string): Promise<boolean>
  createSignUpSession(token: string, data: CreateSignUpSession): Promise<void>
  updateSignUpSession(
    token: string,
    updates: UpdateSignUpSessionData
  ): Promise<void>
  getSignUpSession(token: string): Promise<SignUpSessionData | null | undefined>
  deleteSignUpSession(token: string): Promise<void>
}

export const SESSION_MANAGER = Symbol('ISessionManager')
