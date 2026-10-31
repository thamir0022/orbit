import { Inject, Injectable } from '@nestjs/common'

import { UserId } from '@/modules/user/domain'

import {
  NOTIFICATION_QUERY_REPOSITORY,
  type NotificationQueryRepository,
} from '../../ports/notification-query-repository.port'
import type { NotificationPageOutput } from '../../contracts/notification-list-item.output'
import type { GetNotificationsInput } from './get-notifications.input'
import type { IGetNotificationsUseCase } from './get-notifications.interface'

/**
 * Retrieves the authenticated user's notification inbox.
 *
 * - Enforces recipient ownership through the query repository.
 * - Supports bounded, newest-first cursor pagination.
 * - Includes account-level and workspace notifications.
 */
@Injectable()
export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_QUERY_REPOSITORY)
    private readonly notificationQueryRepository: NotificationQueryRepository
  ) {}

  /** Returns one cursor-paginated page of notifications. */
  execute(input: GetNotificationsInput): Promise<NotificationPageOutput> {
    return this.notificationQueryRepository.findMany({
      recipientId: UserId.create(input.recipientId),
      limit: input.limit ?? 20,
      cursor: input.cursor,
      unreadOnly: input.unreadOnly ?? false,
    })
  }
}
