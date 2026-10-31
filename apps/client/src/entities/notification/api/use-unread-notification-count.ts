'use client'

import { useQuery } from '@tanstack/react-query'

import { useUser } from '@/entities/user/model/user.store'

import { getUnreadNotificationCount } from './notification.api'
import { notificationKeys } from '../model/notification.keys'

/**
 * Retrieves the global unread notification count.
 *
 * - Includes notifications from every accessible workspace.
 * - Supports account-level notifications such as welcome messages.
 */
export function useUnreadNotificationCount() {
  const userId = useUser()?.id ?? ''

  return useQuery({
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: getUnreadNotificationCount,
    enabled: Boolean(userId),
    staleTime: 30_000,
  })
}
