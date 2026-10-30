import type { UserId } from '@/modules/user/domain'
import type { WorkspaceId } from '@/modules/workspace/domain'
import type { ITransactionOptions } from '@/shared/application'
import type { NotificationId } from '../../domain/value-objects/notification-id.vo'
import type {
  NotificationListItemOutput,
  NotificationPageOutput,
} from '../contracts/notification-list-item.output'

/**
 * Read-side filters and pagination for the notification inbox.
 *
 * - Recipient is always derived from the authenticated user.
 * - Workspace is optional so account-wide notifications remain visible.
 */
export interface FindNotificationsQuery {
  readonly recipientId: UserId
  readonly workspaceId?: WorkspaceId | null
  readonly unreadOnly?: boolean
  readonly limit: number
  readonly cursor?: string
}

/**
 * Read-side port for notification listings and counters.
 *
 * - Uses a stable (createdAt, id) descending cursor.
 * - Returns read models instead of domain aggregates.
 */
export interface NotificationQueryRepository {
  findMany(
    query: FindNotificationsQuery,
    options?: ITransactionOptions
  ): Promise<NotificationPageOutput>
  findByIdAndRecipientId(
    id: NotificationId,
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<NotificationListItemOutput | null>
  countUnread(
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<number>
}

/** Injection token for the Notification query repository. */
export const NOTIFICATION_QUERY_REPOSITORY = Symbol(
  'NotificationQueryRepository'
)
