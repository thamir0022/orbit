import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { RealtimeModule } from '@/modules/realtime/realtime.module'

import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case'
import { WelcomeNotificationHandler } from './application/event-handlers/welcome-notification.handler'
import {
  WELCOME_NOTIFICATION_CONTENT,
  createWelcomeNotificationContent,
} from './application/content/welcome-notification.content'

import { NOTIFICATION_REPOSITORY } from './application/ports/notification-repository.port'
import { NOTIFICATION_QUERY_REPOSITORY } from './application/ports/notification-query-repository.port'
import { NOTIFICATION_REALTIME_PUBLISHER } from './application/ports/notification-realtime-publisher.port'

import {
  NotificationModel,
  NotificationSchema,
} from './infrastructure/persistence/mongoose/schemas/notification.schema'
import { notificationProviders } from './infrastructure/providers/notification.provider'

/**
 * Composition root for the Notification bounded context.
 *
 * - Registers MongoDB persistence and query adapters.
 * - Registers application use cases and event handlers.
 * - Configures welcome notification Markdown content.
 * - Integrates with the shared realtime infrastructure.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NotificationModel.name,
        schema: NotificationSchema,
      },
    ]),
    RealtimeModule,
  ],
  providers: [
    ...notificationProviders,

    CreateNotificationUseCase,
    WelcomeNotificationHandler,

    {
      provide: WELCOME_NOTIFICATION_CONTENT,
      useFactory: () =>
        createWelcomeNotificationContent({
          videoUrl: process.env.ORBIT_WELCOME_TUTORIAL_VIDEO_URL,
          thumbnailUrl: process.env.ORBIT_WELCOME_TUTORIAL_THUMBNAIL_URL,
        }),
    },
  ],
  exports: [
    NOTIFICATION_REPOSITORY,
    NOTIFICATION_QUERY_REPOSITORY,
    NOTIFICATION_REALTIME_PUBLISHER,
  ],
})
export class NotificationModule {}
