import type { ITransactionOptions } from '@/shared/application'
import type { UserId } from '@/modules/user/domain'
import type { Notification } from '../../domain/entities/notification.entity'
import type { NotificationId } from '../../domain/value-objects/notification-id.vo'

/**
 * Write-side port for the Notification aggregate.
 *
 * - Save is insert-only; update persists read state.
 * - Scoped lookup protects against cross-recipient mutations.
 */
export interface NotificationRepository {
  save(notification: Notification, options?: ITransactionOptions): Promise<void>

  findByIdAndRecipientId(
    id: NotificationId,
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<Notification | null>

  findByEventIdAndRecipientId(
    eventId: string,
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<Notification | null>

  update(
    notification: Notification,
    options?: ITransactionOptions
  ): Promise<void>

  deleteByIdAndRecipientId(
    id: NotificationId,
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<void>
}

/** Injection token for the Notification write repository. */
export const NOTIFICATION_REPOSITORY = Symbol('NotificationRepository')
