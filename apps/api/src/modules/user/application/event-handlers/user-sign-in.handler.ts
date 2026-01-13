import type { IEventHandler } from '@nestjs/cqrs'
import { Inject, Logger } from '@nestjs/common'
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager'
import type { UserSignedInEvent } from '@/modules/user/domain'

/**
 * User Signed In Event Handler
 * Handles side effects when a user signs in
 */
export class UserSignedInHandler implements IEventHandler<UserSignedInEvent> {
  private readonly logger = new Logger(UserSignedInHandler.name)

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async handle(event: UserSignedInEvent): Promise<void> {
    this.logger.log(
      `User signed in: ${event.email} at ${event.timestamp.toISOString()}`
    )

    // Cache last login info for quick access
    await this.cacheManager.set(
      `user:last-login:${event.userId}`,
      {
        email: event.email,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: event.timestamp.toISOString(),
      },
      30 * 24 * 60 * 60 * 1000 // 30 days TTL
    )

    // Track active sessions count
    const activeSessionsKey = `user:active-sessions:${event.userId}`
    const currentCount =
      (await this.cacheManager.get<number>(activeSessionsKey)) || 0
    await this.cacheManager.set(
      activeSessionsKey,
      currentCount + 1,
      7 * 24 * 60 * 60 * 1000
    )
  }
}
