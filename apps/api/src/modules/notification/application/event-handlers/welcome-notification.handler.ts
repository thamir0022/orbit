import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import {
  USER_REGISTERED_EVENT,
  type UserRegisteredEvent,
} from '@/modules/user/application/events/user-registered.event'

import { NotificationType } from '../../domain/enums/notification-type.enum'
import {
  WELCOME_NOTIFICATION_CONTENT,
  type WelcomeNotificationContent,
} from '../content/welcome-notification.content'
import { CreateNotificationUseCase } from '../use-cases/create-notification.use-case'

/**
 * Handles account registration events to create welcome notifications.
 *
 * - Issues one welcome notification per newly registered account.
 * - Uses the user ID as a deterministic event identity.
 * - Keeps onboarding notifications independent of workspace membership.
 * - Logs delivery failures without affecting account registration.
 */
@Injectable()
export class WelcomeNotificationHandler {
  private readonly logger = new Logger(WelcomeNotificationHandler.name)

  constructor(
    private readonly createNotification: CreateNotificationUseCase,

    @Inject(WELCOME_NOTIFICATION_CONTENT)
    private readonly content: WelcomeNotificationContent
  ) {}

  /** Creates a persistent welcome notification after account registration. */
  @OnEvent(USER_REGISTERED_EVENT, { suppressErrors: true })
  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      // 1. Issue an account-level notification with a deterministic event ID.
      const created = await this.createNotification.execute({
        eventId: event.userId,
        recipientId: event.userId,
        workspaceId: null,
        actorId: null,
        type: NotificationType.SYSTEM_WELCOME,
        title: this.content.title,
        message: this.content.message,
        resource: null,
        metadata: null,
        expiresAt: null,
      })

      // 2. Record successful creation; duplicate events require no action.
      if (created) {
        this.logger.debug(
          `Welcome notification created for user ${event.userId}`
        )
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      const stack = error instanceof Error ? error.stack : undefined

      this.logger.error(
        `Failed to create welcome notification for user ${event.userId}: ${message}`,
        stack
      )
    }
  }
}
