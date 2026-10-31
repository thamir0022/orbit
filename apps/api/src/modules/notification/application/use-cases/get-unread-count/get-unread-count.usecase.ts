import { Inject, Injectable } from '@nestjs/common'

import { UserId } from '@/modules/user/domain'

import {
  NOTIFICATION_QUERY_REPOSITORY,
  type NotificationQueryRepository,
} from '../../ports/notification-query-repository.port'
import type { GetUnreadCountInput } from './get-unread-count.input'
import type {
  GetUnreadCountOutput,
  IGetUnreadCountUseCase,
} from './get-unread-count.interface'

/**
 * Counts unread notifications belonging to the authenticated user.
 *
 * - Excludes expired notifications.
 * - Includes notifications across all workspaces.
 * - Delegates aggregation to the optimized MongoDB query repository.
 */
@Injectable()
export class GetUnreadCountUseCase implements IGetUnreadCountUseCase {
  constructor(
    @Inject(NOTIFICATION_QUERY_REPOSITORY)
    private readonly notificationQueryRepository: NotificationQueryRepository
  ) {}

  /** Returns the current unread notification count. */
  async execute(input: GetUnreadCountInput): Promise<GetUnreadCountOutput> {
    const count = await this.notificationQueryRepository.countUnread(
      UserId.create(input.recipientId)
    )

    return { count }
  }
}
