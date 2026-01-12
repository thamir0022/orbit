import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import { UserCreatedEvent } from '../../domain/events/user-created.event';

/**
 * User Created Event Handler
 * Handles side effects when a user is created
 */
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    this.logger.log(
      `Handling UserCreatedEvent for user: ${event.userId} (${event.email})`
    );

    // Cache the new user's email for quick lookup
    await this.cacheManager.set(
      `user:email:${event.email}`,
      event.userId,
      60000 // 1 minute TTL
    );

    // Here you could also:
    // - Send welcome email
    // - Create default workspace
    // - Initialize user analytics
    // - Send notification to admin

    this.logger.log(`User ${event.email} cached and ready for verification`);
  }
}
