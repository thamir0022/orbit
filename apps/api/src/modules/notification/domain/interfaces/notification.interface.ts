import type { UserId } from '@/modules/user/domain'
import type { WorkspaceId } from '@/modules/workspace/domain'
import type { NotificationType } from '../enums/notification-type.enum'
import type { NotificationId } from '../value-objects/notification-id.vo'
import type {
  NotificationResource,
  NotificationResourceProps,
} from '../value-objects/notification-resource.vo'
import type { NotificationMetadataProps } from './notification-metadata.interface'
import type { NotificationMetadata } from '../value-objects/notification-metadata.vo'

/** Complete aggregate state used for persistence reconstitution. */
export interface NotificationProps {
  readonly id: NotificationId
  readonly workspaceId: WorkspaceId | null
  readonly recipientId: UserId
  readonly actorId: UserId | null
  readonly eventId: string
  readonly type: NotificationType
  readonly title: string
  readonly message: string
  readonly resource: NotificationResource | null
  readonly metadata: NotificationMetadata | null
  readonly readAt: Date | null
  readonly createdAt: Date
  readonly expiresAt: Date | null
}

/** Inputs accepted when issuing a notification from an application event. */
export interface CreateNotificationProps {
  readonly workspaceId?: string | null
  readonly recipientId: string
  readonly actorId?: string | null
  readonly eventId: string
  readonly type: NotificationType
  readonly title: string
  readonly message: string
  readonly resource?: NotificationResourceProps | null
  readonly metadata?: NotificationMetadataProps | null
  readonly expiresAt?: Date | null
}
