import type { UserSummaryOutput } from '@/shared/application/contracts/user-summary.output'
import type { NotificationType } from '../../domain/enums/notification-type.enum'
import type { NotificationResourceProps } from '../../domain/value-objects/notification-resource.vo'
import type { NotificationMetadataProps } from '../../domain/interfaces/notification-metadata.interface'

/**
 * Primary resource data returned with a notification list item.
 *
 * - href is a permanent internal link, not a workspace-slug URL.
 */
export interface NotificationResourceOutput extends NotificationResourceProps {
  readonly href: string
}

/**
 * Lightweight inbox read model returned by the Notification query port.
 *
 * - The actor is enriched with Orbit's shared user-summary contract.
 * - A null actor represents a system action or unavailable user.
 * - Markdown inline links and the primary resource link are independent.
 */
export interface NotificationListItemOutput {
  readonly id: string
  readonly workspaceId: string | null
  readonly recipientId: string
  readonly actor: UserSummaryOutput | null
  readonly type: NotificationType
  readonly title: string
  readonly message: string
  readonly resource: NotificationResourceOutput | null
  readonly metadata: NotificationMetadataProps | null
  readonly readAt: Date | null
  readonly createdAt: Date
}

/** Cursor-based page for a newest-first notification inbox. */
export interface NotificationPageOutput {
  readonly items: NotificationListItemOutput[]
  readonly nextCursor: string | null
  readonly hasNextPage: boolean
}
