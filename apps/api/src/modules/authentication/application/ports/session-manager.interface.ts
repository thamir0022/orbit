/**
 * Identity Session Manager Interface (Port)
 *
 * APPLICATION LAYER port for managing global user sessions.
 * Matches the 'sid' (Session ID) inside the Refresh Token.
 */

export interface SessionData {
  sid: string
  userId: string
  jti: string
  email: string
  ipAddress: string
  userAgent: string
  createdAt: Date
  expiresAt: Date
}

export interface ISessionManager {
  /**
   * Stores the global session metadata when a user logs in.
   * @returns The generated global Session ID (sid)
   */
  createSession(
    data: Omit<SessionData, 'sid' | 'createdAt' | 'expiresAt'>
  ): Promise<string>

  getSession(sid: string): Promise<SessionData | null>

  /**
   * Revokes a specific session (e.g., User clicked "Log Out" on this device).
   */
  revokeSession(sid: string): Promise<void>

  /**
   * Revokes ALL sessions for a user (e.g., Password reset, or Super Admin ban).
   */
  revokeAllUserSessions(userId: string): Promise<void>

  /**
   * Extends the global session heartbeat.
   */
  extendSession(sid: string, newExpiresAt: Date): Promise<void>
}

export const SESSION_MANAGER = Symbol('ISessionManager')
