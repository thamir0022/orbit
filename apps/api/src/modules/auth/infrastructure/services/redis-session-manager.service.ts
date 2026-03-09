import { Inject, Injectable, Logger } from '@nestjs/common'
import { type Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  SignUpStep,
  type CreateSignUpSession,
  type ISessionManager,
  type Session,
  type SessionData,
  type SignUpSessionData,
  type UpdateSession,
  type UpdateSignUpSessionData,
} from '../../application'
import { UuidUtil } from '@/shared/utils'
import {
  REDIS_CONFIG,
  type IRedisConfig,
} from '@/shared/infrastructure/interfaces/redis.config.interface'

// Define input DTO for clarity

@Injectable()
export class RedisSessionManager implements ISessionManager {
  private readonly logger = new Logger(RedisSessionManager.name)
  private static readonly SESSION_PREFIX = 'session:'
  private static readonly USER_SESSIONS_PREFIX = 'user-sessions:'
  private static readonly BLACKLIST_PREFIX = 'blacklist:'
  private static readonly SIGNUP_SESSION = 'signup-session:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    @Inject(REDIS_CONFIG)
    private readonly _config: IRedisConfig
  ) {}

  /* -------------------------------------------------------------------------- */
  /* Session Management (Refresh Tokens)                                        */
  /* -------------------------------------------------------------------------- */

  async createAuthSession(data: SessionData): Promise<string> {
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

  async getAuthSession(sessionId: string): Promise<Session | null> {
    return (await this.cache.get<Session>(this.sessionKey(sessionId))) || null
  }

  async invalidateAuthSession(sessionId: string): Promise<void> {
    const session = await this.getAuthSession(sessionId)
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

  async extendAuthSession(
    sessionId: string,
    updates: UpdateSession,
    expiresAt: Date
  ): Promise<void> {
    const session = await this.getAuthSession(sessionId)
    if (!session) return

    // Calculate remaining time
    const ttl = this.calculateRemainingTTL(expiresAt)
    const updatedSession = { ...session, ...updates, expiresAt }

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

  async createSignUpSession(
    token: string,
    data: CreateSignUpSession
  ): Promise<void> {
    const existingSession = await this.getSignUpSession(token)

    if (existingSession) throw new Error('Session already exist for this token') // TODO: Throw specific exception
    const newSessionData: SignUpSessionData = {
      firstName: undefined,
      lastName: undefined,
      passwordHash: undefined,

      email: data.email,
      isEmailVerified: data.isEmailVerified,
      currentStep: SignUpStep.EMAIL_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const ttl = this.getSignUpSessionTTL()

    await this.cache.set(this.signUpSessionKey(token), newSessionData, ttl)
  }

  async getSignUpSession(
    token: string
  ): Promise<SignUpSessionData | null | undefined> {
    return await this.cache.get(this.signUpSessionKey(token))
  }

  async updateSignUpSession(
    token: string,
    updates: UpdateSignUpSessionData
  ): Promise<void> {
    const existingSession = await this.getSignUpSession(token)

    if (!existingSession) throw new Error('Session expired or invalid') // TODO: Throw specific exception

    const updatedSession: SignUpSessionData = {
      ...existingSession,
      ...updates,
      email: existingSession.email,
      createdAt: existingSession.createdAt,
      updatedAt: new Date(),
    }

    const ttl = this.getSignUpSessionTTL()

    await this.cache.set(this.signUpSessionKey(token), updatedSession, ttl)
  }

  async deleteSignUpSession(token: string): Promise<void> {
    await this.cache.del(this.signUpSessionKey(token))
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
    return this._config.sessionTTL
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
  private signUpSessionKey(token: string) {
    return `${RedisSessionManager.SIGNUP_SESSION}${token}`
  }

  private getSignUpSessionTTL(): number {
    return this._config.signUpSessionTTL
  }
}
