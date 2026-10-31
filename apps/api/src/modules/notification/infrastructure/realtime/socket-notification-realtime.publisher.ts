import { Inject, Injectable } from '@nestjs/common'
import type { UserId } from '@/modules/user/domain'
import {
  REALTIME_PUBLISHER,
  type RealtimePublisher,
} from '@/modules/realtime/application/ports/realtime-publisher.port'
import type { NotificationRealtimePublisher } from '../../application/ports/notification-realtime-publisher.port'

/**
 * Best-effort Socket.IO adapter for notifying clients of inbox changes.
 *
 * - Pushes only an invalidation event, never full notification content.
 * - Clients refetch from the authorized HTTP notification API.
 */
@Injectable()
export class SocketNotificationRealtimePublisher implements NotificationRealtimePublisher {
  constructor(
    @Inject(REALTIME_PUBLISHER)
    private readonly realtime: RealtimePublisher
  ) {}

  /** Signals all connected devices of a recipient to refresh their inbox. */
  publishChanged(recipientId: UserId): void {
    this.realtime.publishToUser(recipientId.value, 'notifications:changed', {})
  }
}
