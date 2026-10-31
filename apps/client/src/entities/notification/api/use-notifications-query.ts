'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

import { useUser } from '@/entities/user/model/user.store'

import { getNotifications } from './notification.api'
import { notificationKeys } from '../model/notification.keys'
import type { NotificationFilter } from '../model/notification.types'

/**
 * Retrieves recipient-owned notifications using cursor pagination.
 *
 * - Maintains independent caches for All and Unread views.
 * - Uses the authenticated user ID for cache isolation.
 * - Loads additional pages only when requested.
 */
export function useNotificationsQuery(filter: NotificationFilter) {
  const userId = useUser()?.id ?? ''

  return useInfiniteQuery({
    queryKey: notificationKeys.list(userId, filter),
    enabled: Boolean(userId),
    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) =>
      getNotifications({
        limit: 20,
        cursor: pageParam,
        unreadOnly: filter === 'unread',
      }),

    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,

    staleTime: 30_000,
  })
}
