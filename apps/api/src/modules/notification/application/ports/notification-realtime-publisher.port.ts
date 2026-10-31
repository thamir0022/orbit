import type { UserId } from '@/modules/user/domain'

/**
 * Notification-specific realtime publisher contract.
 *
 * - Emits cache-invalidation signals, not private notification bodies.
 * - Delivery is best effort; MongoDB remains the source of truth.
 */
export interface NotificationRealtimePublisher {
  publishChanged(recipientId: UserId): void
}

/** Injection token for the Notification realtime publisher. */
export const NOTIFICATION_REALTIME_PUBLISHER = Symbol(
  'NotificationRealtimePublisher'
)
