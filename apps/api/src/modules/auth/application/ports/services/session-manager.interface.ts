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
  email: string
  ipAddress: string
  userAgent: string
}

export interface Session extends SessionData {
  sessionId: string
  createdAt: Date
  expiresAt: Date
}

export interface ISessionManager {
  createSession(data: SessionData): Promise<string>
  getSession(sessionId: string): Promise<Session | null>
  invalidateSession(sessionId: string): Promise<void>
  invalidateAllUserSessions(userId: string): Promise<void>
  extendSession(sessionId: string, newExpiresAt: Date): Promise<void>
  blacklistToken(jti: string, expiresAt: Date): Promise<void>
  isTokenBlacklisted(jti: string): Promise<boolean>
}

export const SESSION_MANAGER = Symbol('ISessionManager')
