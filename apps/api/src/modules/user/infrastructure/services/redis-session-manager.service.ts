import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager'
import { v4 as uuidv4 } from 'uuid'
import type {
  ISessionManager,
  SessionData,
} from '@/modules/user/application'

/**
 * Redis Session Manager (Adapter)
 *
 * INFRASTRUCTURE LAYER - Implements the ISessionManager port
 *
 * Encapsulates Redis caching details for session management.
 */
@Injectable()
export class RedisSessionManager implements ISessionManager {
  private readonly SESSION_PREFIX = 'session:'
  private readonly USER_SESSIONS_PREFIX = 'user-sessions:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async createSession(data: SessionData): Promise<string> {
    const sessionId = uuidv4()
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${data.userId}`

    const ttl = data.expiresAt.getTime() - Date.now()

    await this.cacheManager.set(sessionKey, JSON.stringify(data), ttl)

    const userSessions = await this.cacheManager.get<string>(userSessionsKey)
    const sessions: string[] = userSessions ? JSON.parse(userSessions) : []
    sessions.push(sessionId)
    await this.cacheManager.set(userSessionsKey, JSON.stringify(sessions), ttl)

    return sessionId
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
    const data = await this.cacheManager.get<string>(sessionKey)

    if (!data) {
      return null
    }

    const parsed = JSON.parse(data)
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      expiresAt: new Date(parsed.expiresAt),
    }
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return

    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${session.userId}`

    await this.cacheManager.del(sessionKey)

    const userSessions = await this.cacheManager.get<string>(userSessionsKey)
    if (userSessions) {
      const sessions: string[] = JSON.parse(userSessions)
      const updatedSessions = sessions.filter((id) => id !== sessionId)
      if (updatedSessions.length > 0) {
        await this.cacheManager.set(
          userSessionsKey,
          JSON.stringify(updatedSessions)
        )
      } else {
        await this.cacheManager.del(userSessionsKey)
      }
    }
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`
    const userSessions = await this.cacheManager.get<string>(userSessionsKey)

    if (userSessions) {
      const sessions: string[] = JSON.parse(userSessions)
      await Promise.all(
        sessions.map((sessionId) =>
          this.cacheManager.del(`${this.SESSION_PREFIX}${sessionId}`)
        )
      )
      await this.cacheManager.del(userSessionsKey)
    }
  }

  async extendSession(sessionId: string, newExpiresAt: Date): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return

    session.expiresAt = newExpiresAt
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
    const ttl = newExpiresAt.getTime() - Date.now()

    await this.cacheManager.set(sessionKey, JSON.stringify(session), ttl)
  }
}
