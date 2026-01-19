import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import type {
  ISessionManager,
  Session,
  SessionData,
  UpdateSession,
} from '../../application/ports/services/session-manager.interface'
import { UuidUtil } from '@/shared/utils'

// Define input DTO for clarity

@Injectable()
export class RedisSessionManager implements ISessionManager {
  private readonly logger = new Logger(RedisSessionManager.name)
  private static readonly SESSION_PREFIX = 'session:'
  private static readonly USER_SESSIONS_PREFIX = 'user-sessions:'
  private static readonly BLACKLIST_PREFIX = 'blacklist:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly _config: ConfigService
  ) {}

  /* -------------------------------------------------------------------------- */
  /* Session Management (Refresh Tokens)                                        */
  /* -------------------------------------------------------------------------- */

  async createSession(data: SessionData): Promise<string> {
    const sessionId = UuidUtil.generate()
    const now = Date.now()

    // 1. Get duration from config (Default: 7 days)
    const ttl = this.getDefaultTTL()

    const session: Session = {
      sessionId,
      userId: data.userId,
      jti: data.jti,
      email: data.email,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: new Date(now),
      expiresAt: new Date(now + ttl), // Sync JSON with Redis TTL
    }

    await Promise.all([
      this.cache.set(this.sessionKey(sessionId), session, ttl),
      this.appendUserSession(data.userId, sessionId, ttl),
    ])

    return sessionId
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return (await this.cache.get<Session>(this.sessionKey(sessionId))) || null
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return

    await Promise.all([
      this.cache.del(this.sessionKey(sessionId)),
      this.removeUserSession(session.userId, sessionId),
    ])
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId)

    const deletePromises = sessions.map((id) =>
      this.cache.del(this.sessionKey(id))
    )

    await Promise.all([
      ...deletePromises,
      this.cache.del(this.userSessionsKey(userId)),
    ])
  }

  async extendSession({sessionId, updates, expiresAt} : UpdateSession): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return

    // Calculate remaining time
    const ttl = this.calculateRemainingTTL(expiresAt)
    const updatedSession = { ...session,  ...updates, expiresAt }

    await Promise.all([
      this.cache.set(this.sessionKey(sessionId), updatedSession, ttl),
      this.refreshUserSessionListTTL(session.userId, ttl),
    ])
  }

  /* -------------------------------------------------------------------------- */
  /* Token Blacklisting (Access Tokens)                                         */
  /* -------------------------------------------------------------------------- */

  /**
   * Blacklists a JTI (Access Token ID) until it expires naturally.
   * This is used during logout to invalidate the specific Access Token
   * the user is currently holding.
   */
  async blacklistToken(jti: string, expiresAt: Date): Promise<void> {
    const ttl = this.calculateRemainingTTL(expiresAt)

    // If token is already expired, no need to blacklist
    if (ttl <= 0) return

    // Store 'true' (or any value) with the remaining TTL
    await this.cache.set(this.blacklistKey(jti), 'true', ttl)
  }

  /**
   * Checks if a token ID is in the blacklist.
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const entry = await this.cache.get(this.blacklistKey(jti))
    return !!entry
  }

  /* -------------------------------------------------------------------------- */
  /* Private Helpers                                                            */
  /* -------------------------------------------------------------------------- */

  private async appendUserSession(
    userId: string,
    sessionId: string,
    ttl: number
  ): Promise<void> {
    const sessions = await this.getUserSessions(userId)
    sessions.push(sessionId)
    await this.cache.set(this.userSessionsKey(userId), sessions, ttl)
  }

  private async removeUserSession(
    userId: string,
    sessionId: string
  ): Promise<void> {
    const sessions = await this.getUserSessions(userId)
    const updated = sessions.filter((id) => id !== sessionId)

    if (updated.length === 0) {
      await this.cache.del(this.userSessionsKey(userId))
    } else {
      // Keep remaining list alive for the default duration
      await this.cache.set(
        this.userSessionsKey(userId),
        updated,
        this.getDefaultTTL()
      )
    }
  }

  private async refreshUserSessionListTTL(
    userId: string,
    ttl: number
  ): Promise<void> {
    const sessions = await this.getUserSessions(userId)
    if (sessions.length > 0) {
      await this.cache.set(this.userSessionsKey(userId), sessions, ttl)
    }
  }

  private async getUserSessions(userId: string): Promise<string[]> {
    return (await this.cache.get<string[]>(this.userSessionsKey(userId))) || []
  }

  /**
   * Get the standard Session Duration (e.g. 7 Days) in Milliseconds
   */
  private getDefaultTTL(): number {
    return Number(this._config.get<number>('SESSION_TTL_MS', 604800000))
  }

  /**
   * Calculate Milliseconds between Now and Target Date
   */
  private calculateRemainingTTL(expiresAt: Date): number {
    return Math.max(expiresAt.getTime() - Date.now(), 0)
  }

  private sessionKey(id: string): string {
    return `${RedisSessionManager.SESSION_PREFIX}${id}`
  }
  private userSessionsKey(id: string): string {
    return `${RedisSessionManager.USER_SESSIONS_PREFIX}${id}`
  }
  private blacklistKey(jti: string): string {
    return `${RedisSessionManager.BLACKLIST_PREFIX}${jti}`
  }
}
