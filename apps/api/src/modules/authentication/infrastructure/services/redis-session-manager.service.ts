import { Inject, Injectable } from '@nestjs/common'
import { type Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { UuidUtil } from '@/shared/utils'
import { type ISessionManager, type SessionData } from '../../application'
import {
  REDIS_CONFIG,
  type IRedisConfig,
} from '@/shared/infrastructure/interfaces/redis.config.interface'

@Injectable()
export class RedisSessionManager implements ISessionManager {
  private static readonly SESSION_PREFIX = 'session:'
  private static readonly USER_SESSIONS_PREFIX = 'user-sessions:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    @Inject(REDIS_CONFIG)
    private readonly config: IRedisConfig
  ) {}

  async createSession(
    data: Omit<SessionData, 'sid' | 'createdAt' | 'expiresAt'>
  ): Promise<string> {
    const sid = UuidUtil.generate()
    const now = Date.now()
    const ttl = this.config.sessionTTL

    const session: SessionData = {
      sid,
      ...data,
      createdAt: new Date(now),
      expiresAt: new Date(now + ttl),
    }

    await Promise.all([
      this.cache.set(this.sessionKey(sid), session, ttl),
      this.appendUserSession(data.userId, sid, ttl),
    ])

    return sid
  }

  async getSession(sid: string): Promise<SessionData | null> {
    const session = await this.cache.get<SessionData>(this.sessionKey(sid))
    return session ?? null
  }

  async revokeSession(sid: string): Promise<void> {
    const session = await this.getSession(sid)
    if (!session) return

    await Promise.all([
      this.cache.del(this.sessionKey(sid)),
      this.removeUserSession(session.userId, sid),
    ])
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId)

    const deletePromises = sessions.map((sid) =>
      this.cache.del(this.sessionKey(sid))
    )

    await Promise.all([
      ...deletePromises,
      this.cache.del(this.userSessionsKey(userId)),
    ])
  }

  async extendSession(sid: string, newExpiresAt: Date): Promise<void> {
    const session = await this.getSession(sid)
    if (!session) return

    const ttl = this.calculateRemainingTTL(newExpiresAt)
    const updatedSession: SessionData = {
      ...session,
      expiresAt: newExpiresAt,
    }

    await Promise.all([
      this.cache.set(this.sessionKey(sid), updatedSession, ttl),
      this.refreshUserSessionListTTL(session.userId, ttl),
    ])
  }

  /* -------------------------------------------------------------------------- */
  /* Private Helpers                                                            */
  /* -------------------------------------------------------------------------- */

  private async appendUserSession(
    userId: string,
    sid: string,
    ttl: number
  ): Promise<void> {
    const sessions = await this.getUserSessions(userId)
    sessions.push(sid)
    await this.cache.set(this.userSessionsKey(userId), sessions, ttl)
  }

  private async removeUserSession(userId: string, sid: string): Promise<void> {
    const sessions = await this.getUserSessions(userId)
    const updated = sessions.filter((id) => id !== sid)

    if (updated.length === 0) {
      await this.cache.del(this.userSessionsKey(userId))
    } else {
      await this.cache.set(
        this.userSessionsKey(userId),
        updated,
        this.config.sessionTTL
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
    const sessions = await this.cache.get<string[]>(
      this.userSessionsKey(userId)
    )
    return sessions ?? []
  }

  private calculateRemainingTTL(expiresAt: Date): number {
    return Math.max(expiresAt.getTime() - Date.now(), 0)
  }

  private sessionKey(id: string): string {
    return `${RedisSessionManager.SESSION_PREFIX}${id}`
  }

  private userSessionsKey(id: string): string {
    return `${RedisSessionManager.USER_SESSIONS_PREFIX}${id}`
  }
}
