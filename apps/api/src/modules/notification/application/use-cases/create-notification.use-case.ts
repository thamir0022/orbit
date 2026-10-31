import { Inject, Injectable, Logger } from '@nestjs/common'

import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from '../ports/notification-repository.port'
import {
  NOTIFICATION_REALTIME_PUBLISHER,
  type NotificationRealtimePublisher,
} from '../ports/notification-realtime-publisher.port'
import { Notification } from '../../domain/entities/notification.entity'
import type { CreateNotificationProps } from '../../domain/interfaces/notification.interface'

/**
 * Creates a persistent notification for a single recipient.
 *
 * - Validates notification state through the domain aggregate.
 * - Uses MongoDB uniqueness constraints for idempotent creation.
 * - Publishes a realtime invalidation only after persistence succeeds.
 * - Keeps realtime failures independent of database persistence.
 *
 * Recipient eligibility and workspace access must be verified by the
 * originating business workflow before calling this use case.
 */
@Injectable()
export class CreateNotificationUseCase {
  private readonly logger = new Logger(CreateNotificationUseCase.name)

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,

    @Inject(NOTIFICATION_REALTIME_PUBLISHER)
    private readonly realtimePublisher: NotificationRealtimePublisher
  ) {}

  /**
   * Creates a notification unless the same event was already delivered.
   *
   * @returns true if created, false if already delivered.
   */
  async execute(input: CreateNotificationProps): Promise<boolean> {
    // 1. Construct and validate the notification aggregate.
    const notification = Notification.create(input)

    // 2. Persist with database-enforced idempotency.
    try {
      await this.notificationRepository.save(notification)
    } catch (error: unknown) {
      if (!this.isDuplicateKeyError(error)) {
        throw error
      }

      // Only suppress a duplicate if this recipient already received the event.
      const existing =
        await this.notificationRepository.findByEventIdAndRecipientId(
          notification.eventId,
          notification.recipientId
        )

      if (!existing) {
        throw error
      }

      return false
    }

    // 3. Notify connected clients after successful persistence.
    try {
      this.realtimePublisher.publishChanged(notification.recipientId)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)

      this.logger.warn(
        `Realtime notification delivery failed for recipient ${notification.recipientId.value}: ${message}`
      )
    }

    return true
  }

  /** Recognizes MongoDB duplicate-key errors without unsafe type assertions. */
  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    )
  }
}
