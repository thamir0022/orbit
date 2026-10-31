'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '@/entities/notification/api/notification.api'
import { notificationKeys } from '@/entities/notification/model/notification.keys'

/**
 * Manages notification read-state and deletion mutations.
 *
 * - Uses the API as the source of truth.
 * - Invalidates inbox and unread-count queries after changes.
 * - Reports failed operations using the shared toast system.
 */
export function useNotificationActions() {
  const queryClient = useQueryClient()

  /** Refreshes all notification-related server state. */
  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: notificationKeys.all,
    })
  }

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
    onError: () => toast.error('Could not mark notification as read'),
  })

  const markUnread = useMutation({
    mutationFn: markNotificationUnread,
    onSuccess: invalidate,
    onError: () => toast.error('Could not mark notification as unread'),
  })

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
    onError: () => toast.error('Could not mark all notifications as read'),
  })

  const remove = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidate,
    onError: () => toast.error('Could not delete notification'),
  })

  return {
    markRead,
    markUnread,
    markAllRead,
    remove,
  }
}
