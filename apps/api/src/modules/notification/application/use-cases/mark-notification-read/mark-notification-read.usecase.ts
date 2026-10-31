import { Inject, Injectable, Logger } from '@nestjs/common'

import { UserId } from '@/modules/user/domain'

import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from '../../ports/notification-repository.port'
import {
  NOTIFICATION_REALTIME_PUBLISHER,
  type NotificationRealtimePublisher,
} from '../../ports/notification-realtime-publisher.port'

import { NotificationNotFoundException } from '../../../domain/exceptions/notification-not-found.exception'
import { NotificationId } from '../../../domain/value-objects/notification-id.vo'

import type { MarkNotificationReadInput } from './mark-notification-read.input'
import type { IMarkNotificationReadUseCase } from './mark-notification-read.interface'

/**
 * Marks a recipient-owned notification as read.
 *
 * - Prevents access to other recipients' notifications.
 * - Rejects expired notifications.
 * - Uses the aggregate's idempotent read-state transition.
 * - Publishes realtime invalidation only after persistence succeeds.
 */
@Injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
  private readonly logger = new Logger(MarkNotificationReadUseCase.name)

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,

    @Inject(NOTIFICATION_REALTIME_PUBLISHER)
    private readonly realtimePublisher: NotificationRealtimePublisher
  ) {}

  /** Persists the read-state transition for an existing notification. */
  async execute(input: MarkNotificationReadInput): Promise<void> {
    // 1. Validate identities and load the recipient-owned aggregate.
    const notificationId = NotificationId.create(input.notificationId)
    const recipientId = UserId.create(input.recipientId)

    const notification =
      await this.notificationRepository.findByIdAndRecipientId(
        notificationId,
        recipientId
      )

    // 2. Hide missing, inaccessible, and expired notifications.
    if (!notification || notification.isExpired()) {
      throw new NotificationNotFoundException()
    }

    // 3. Apply the domain transition only when needed.
    const changed = notification.markRead()

    if (!changed) {
      return
    }

    // 4. Persist the updated read state.
    await this.notificationRepository.update(notification)

    // 5. Inform other connected devices of the inbox change.
    try {
      this.realtimePublisher.publishChanged(recipientId)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)

      this.logger.warn(
        `Failed to publish notification update for recipient ${recipientId.value}: ${message}`
      )
    }
  }
}
