import type { NotificationFilter } from './notification.types'

/**
 * Cache keys for authenticated notification queries.
 *
 * - Isolates data between user accounts.
 * - Groups inbox and unread-count queries for realtime invalidation.
 */
export const notificationKeys = {
  all: ['notifications'] as const,

  list: (userId: string, filter: NotificationFilter) =>
    [...notificationKeys.all, userId, 'list', filter] as const,

  unreadCount: (userId: string) =>
    [...notificationKeys.all, userId, 'unread-count'] as const,
}
