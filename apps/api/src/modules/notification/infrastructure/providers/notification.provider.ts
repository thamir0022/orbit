import type { Provider } from '@nestjs/common'
import { NOTIFICATION_REPOSITORY } from '../../application/ports/notification-repository.port'
import { NOTIFICATION_QUERY_REPOSITORY } from '../../application/ports/notification-query-repository.port'
import { NOTIFICATION_REALTIME_PUBLISHER } from '../../application/ports/notification-realtime-publisher.port'
import { MongoNotificationRepository } from '../persistence/mongoose/repositories/mongo-notification.repository'
import { MongoNotificationQueryRepository } from '../persistence/mongoose/repositories/mongo-notification-query.repository'
import { SocketNotificationRealtimePublisher } from '../realtime/socket-notification-realtime.publisher'

/**
 * Binds Notification application ports to infrastructure adapters.
 *
 * - Keeps persistence and realtime implementations outside the domain.
 */
export const notificationProviders: Provider[] = [
  { provide: NOTIFICATION_REPOSITORY, useClass: MongoNotificationRepository },
  {
    provide: NOTIFICATION_QUERY_REPOSITORY,
    useClass: MongoNotificationQueryRepository,
  },
  {
    provide: NOTIFICATION_REALTIME_PUBLISHER,
    useClass: SocketNotificationRealtimePublisher,
  },
]
