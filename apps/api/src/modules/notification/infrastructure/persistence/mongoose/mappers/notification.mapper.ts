import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { Notification } from '../../../../domain/entities/notification.entity'
import { NotificationId } from '../../../../domain/value-objects/notification-id.vo'
import { NotificationMetadata } from '../../../../domain/value-objects/notification-metadata.vo'
import { NotificationResource } from '../../../../domain/value-objects/notification-resource.vo'
import type { NotificationModel } from '../schemas/notification.schema'
import { notificationUuid } from './notification-uuid'

/**
 * Maps a Notification aggregate to and from the MongoDB model.
 *
 * - Keeps BSON conversion out of the domain layer.
 * - The query repository owns optimized read models.
 */
export class NotificationMapper {
  /** Restores a domain notification from a hydrated or lean document. */
  static toDomain(document: NotificationModel): Notification {
    return Notification.reconstitute({
      id: NotificationId.create(notificationUuid(document.id)),
      workspaceId: document.workspaceId
        ? WorkspaceId.create(notificationUuid(document.workspaceId))
        : null,
      recipientId: UserId.create(notificationUuid(document.recipientId)),
      actorId: document.actorId
        ? UserId.create(notificationUuid(document.actorId))
        : null,
      eventId: notificationUuid(document.eventId),
      type: document.type,
      title: document.title,
      message: document.message,
      resource:
        document.resourceType && document.resourceId
          ? NotificationResource.create({
              type: document.resourceType,
              id: notificationUuid(document.resourceId),
              ...(document.resourceLabel
                ? { label: document.resourceLabel }
                : {}),
            })
          : null,
      metadata: document.metadata
        ? NotificationMetadata.create(document.metadata)
        : null,
      readAt: document.readAt ?? null,
      createdAt: document.createdAt,
      expiresAt: document.expiresAt ?? null,
    })
  }

  /** Converts an aggregate to persistence fields without leaking Mongoose types. */
  static toPersistence(notification: Notification): NotificationModel {
    return {
      id: notification.id.value,
      workspaceId: notification.workspaceId?.value ?? null,
      recipientId: notification.recipientId.value,
      actorId: notification.actorId?.value ?? null,
      eventId: notification.eventId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      resourceType: notification.resource?.type ?? null,
      resourceId: notification.resource?.id ?? null,
      resourceLabel: notification.resource?.label ?? null,
      metadata: notification.metadata?.value ?? null,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      expiresAt: notification.expiresAt,
    }
  }
}
