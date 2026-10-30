import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { RealtimeModule } from '@/modules/realtime/realtime.module'
import { notificationProviders } from './infrastructure/providers/notification.provider'
import {
  NotificationModel,
  NotificationSchema,
} from './infrastructure/persistence/mongoose/schemas/notification.schema'
import { NOTIFICATION_REPOSITORY } from './application/ports/notification-repository.port'
import { NOTIFICATION_QUERY_REPOSITORY } from './application/ports/notification-query-repository.port'
import { NOTIFICATION_REALTIME_PUBLISHER } from './application/ports/notification-realtime-publisher.port'

/**
 * Composition root for the Notification bounded context.
 *
 * - Registers Mongoose read/write adapters.
 * - Exports application ports for upcoming use cases and event listeners.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationModel.name, schema: NotificationSchema },
    ]),
    RealtimeModule,
  ],
  providers: notificationProviders,
  exports: [
    NOTIFICATION_REPOSITORY,
    NOTIFICATION_QUERY_REPOSITORY,
    NOTIFICATION_REALTIME_PUBLISHER,
  ],
})
export class NotificationModule {}
