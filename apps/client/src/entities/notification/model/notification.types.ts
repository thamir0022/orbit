/**
 * Lightweight user data included with notification read models.
 *
 * Matches the API's shared UserSummaryOutput contract.
 */
export interface NotificationActor {
  readonly id: string
  readonly displayName: string
  readonly avatarUrl: string | null
}

/** Stable resource reference used for permanent navigation. */
export interface NotificationResource {
  readonly type: string
  readonly id: string
  readonly label?: string
  readonly href: string
}

/** Optional navigation action attached to a notification. */
export interface NotificationAction {
  readonly label: string
  readonly href?: string
  readonly resource?: {
    readonly type: string
    readonly id: string
    readonly label?: string
  }
}

/** Extensible, JSON-compatible notification metadata. */
export interface NotificationMetadata {
  readonly version?: 1
  readonly actions?: readonly NotificationAction[]
  readonly data?: Readonly<Record<string, unknown>>
}

/**
 * Notification item returned by the API.
 *
 * - readAt is null for unread notifications.
 * - message contains Markdown rendered by Streamdown.
 * - resource.href points to the permanent resource resolver.
 */
export interface Notification {
  readonly id: string
  readonly workspaceId: string | null
  readonly recipientId: string
  readonly actor: NotificationActor | null
  readonly type: string
  readonly title: string
  readonly message: string
  readonly resource: NotificationResource | null
  readonly metadata: NotificationMetadata | null
  readonly readAt: string | null
  readonly createdAt: string
}

/** Newest-first, cursor-paginated notification response. */
export interface NotificationPage {
  readonly items: Notification[]
  readonly nextCursor: string | null
  readonly hasNextPage: boolean
}

/** Filter supported by the initial Orbit inbox. */
export type NotificationFilter = 'all' | 'unread'

/** Unread count returned for the global notification badge. */
export interface NotificationUnreadCount {
  readonly count: number
}
