import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import type {
  NotificationPage,
  NotificationUnreadCount,
} from '../model/notification.types'

/** Parameters supported by the notification inbox endpoint. */
export interface GetNotificationsParams {
  readonly limit?: number
  readonly cursor?: string
  readonly unreadOnly?: boolean
}

/** Fetches one page of recipient-owned notifications. */
export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<NotificationPage> {
  const search = new URLSearchParams()

  search.set('limit', String(params.limit ?? 20))

  if (params.cursor) {
    search.set('cursor', params.cursor)
  }

  if (params.unreadOnly) {
    search.set('unread', 'true')
  }

  const { data } = await httpClient.get<NotificationPage>(
    `${API_ROUTES.NOTIFICATIONS.BASE}?${search.toString()}`
  )

  return data
}

/** Retrieves the authenticated user's unread notification count. */
export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await httpClient.get<NotificationUnreadCount>(
    API_ROUTES.NOTIFICATIONS.UNREAD_COUNT
  )

  return data.count
}

/** Marks one recipient-owned notification as read. */
export async function markNotificationRead(id: string): Promise<void> {
  await httpClient.patch(API_ROUTES.NOTIFICATIONS.READ(id), {})
}

/** Restores one notification to the unread state. */
export async function markNotificationUnread(id: string): Promise<void> {
  await httpClient.patch(API_ROUTES.NOTIFICATIONS.UNREAD(id), {})
}

/** Marks every notification belonging to the user as read. */
export async function markAllNotificationsRead(): Promise<void> {
  await httpClient.patch(API_ROUTES.NOTIFICATIONS.READ_ALL, {})
}

/** Permanently removes one recipient-owned notification. */
export async function deleteNotification(id: string): Promise<void> {
  await httpClient.delete(API_ROUTES.NOTIFICATIONS.DELETE(id))
}
