import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { v4 as uuidv4 } from 'uuid'
import type { ISessionManager, SessionData } from '@/modules/user/application'

/**
 * Redis-backed Session Manager
 *
 * Infrastructure layer adapter
 */
@Injectable()
export class RedisSessionManager implements ISessionManager {
  private static readonly SESSION_PREFIX = 'session:'
  private static readonly USER_SESSIONS_PREFIX = 'user-sessions:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache
  ) {}

  /* -------------------------------------------------------------------------- */
  /* Public API                                                                 */
  /* -------------------------------------------------------------------------- */

  async createSession(data: SessionData): Promise<string> {
    const sessionId = uuidv4()
    const ttl = this.calculateTTL(data.expiresAt)

    await Promise.all([
      this.storeSession(sessionId, data, ttl),
      this.appendUserSession(data.userId, sessionId, ttl),
    ])

    return sessionId
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = await this.cache.get<SessionData>(
      this.sessionKey(sessionId)
    )
    if (!session) return null

    return session
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
    if (!sessions.length) return

    await Promise.all([
      ...sessions.map((id) => this.cache.del(this.sessionKey(id))),
      this.cache.del(this.userSessionsKey(userId)),
    ])
  }

  async extendSession(sessionId: string, newExpiresAt: Date): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return

    const ttl = this.calculateTTL(newExpiresAt)

    await this.storeSession(
      sessionId,
      { ...session, expiresAt: newExpiresAt },
      ttl
    )
  }

  /* -------------------------------------------------------------------------- */
  /* Private Helpers                                                            */
  /* -------------------------------------------------------------------------- */

  private async storeSession(
    sessionId: string,
    data: SessionData,
    ttl: number
  ): Promise<void> {
    await this.cache.set(this.sessionKey(sessionId), data, ttl)
  }

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
      return
    }

    await this.cache.set(this.userSessionsKey(userId), updated)
  }

  private async getUserSessions(userId: string): Promise<string[]> {
    const raw = await this.cache.get<string[]>(this.userSessionsKey(userId))

    return raw ? raw : []
  }

  private calculateTTL(expiresAt: Date): number {
    const ttlMs = expiresAt.getTime() - Date.now()
    return Math.max(Math.floor(ttlMs / 1000), 0)
  }

  private sessionKey(sessionId: string): string {
    return `${RedisSessionManager.SESSION_PREFIX}${sessionId}`
  }

  private userSessionsKey(userId: string): string {
    return `${RedisSessionManager.USER_SESSIONS_PREFIX}${userId}`
  }
}
