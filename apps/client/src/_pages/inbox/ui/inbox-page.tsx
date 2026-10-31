'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCheck, Inbox, RefreshCw, AlertCircle } from 'lucide-react'

import { useNotificationsQuery } from '@/entities/notification/api/use-notifications-query'
import { useUnreadNotificationCount } from '@/entities/notification/api/use-unread-notification-count'
import { notificationKeys } from '@/entities/notification/model/notification.keys'
import type {
  Notification,
  NotificationFilter,
} from '@/entities/notification/model/notification.types'

import { useNotificationActions } from '@/features/notification/model/use-notification-actions'
import { NotificationList } from '@/widgets/inbox/ui/notification-list'
import { NotificationDetail } from '@/widgets/inbox/ui/notification-detail'

import { Button } from '@/shared/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { cn } from '@/shared/lib/utils'

/**
 * Notification inbox screen for the authenticated user.
 *
 * - Displays an account-wide, newest-first notification feed.
 * - Supports All and Unread filters with cursor pagination.
 * - Provides a responsive list/detail experience.
 * - Coordinates notification mutations through feature hooks.
 */
export function InboxPage() {
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsQuery(filter)

  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  const actions = useNotificationActions()

  const notifications = data?.pages.flatMap((page) => page.items) ?? []

  const selectedNotification =
    notifications.find((notification) => notification.id === selectedId) ??
    notifications[0] ??
    null

  /** Opens a notification without disrupting an unread-only feed. */
  const handleSelect = (notification: Notification): void => {
    setSelectedId(notification.id)
    setMobileDetailOpen(true)

    // In the All view, opening a notification also marks it as read.
    if (filter === 'all' && notification.readAt === null) {
      actions.markRead.mutate(notification.id)
    }
  }

  /** Deletes a notification and clears the current selection when needed. */
  const handleDelete = (id: string): void => {
    if (selectedNotification?.id === id) {
      setSelectedId(null)
      setMobileDetailOpen(false)
    }

    actions.remove.mutate(id)
  }

  /** Refreshes both the inbox feed and the global unread count. */
  const handleRefresh = (): void => {
    void queryClient.invalidateQueries({
      queryKey: notificationKeys.all,
    })
  }

  /** Switches inbox filters and returns mobile users to the list. */
  const handleFilterChange = (value: string): void => {
    setFilter(value === 'unread' ? 'unread' : 'all')
    setSelectedId(null)
    setMobileDetailOpen(false)
  }

  return (
    <main
      className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-xl border bg-background"
      aria-labelledby="inbox-heading"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Inbox className="size-4" aria-hidden="true" />
          </div>

          <div className="space-y-0.5">
            <h1
              id="inbox-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Inbox
            </h1>

            <p className="text-xs text-muted-foreground" aria-live="polite">
              {unreadCount === 0
                ? 'All caught up'
                : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh notifications"
            onClick={handleRefresh}
          >
            <RefreshCw aria-hidden="true" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={actions.markAllRead.isPending}
            disabled={unreadCount === 0}
            onClick={() => actions.markAllRead.mutate()}
          >
            <CheckCheck aria-hidden="true" />
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">Read all</span>
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 min-w-0 flex-1 md:grid-cols-[minmax(280px,370px)_minmax(0,1fr)]">
        <section
          aria-label="Notification inbox"
          className={cn(
            'min-h-0 min-w-0 flex-col border-r',
            mobileDetailOpen ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="shrink-0 border-b px-4 py-3">
            <Tabs value={filter} onValueChange={handleFilterChange}>
              <TabsList
                aria-label="Filter notifications"
                className="h-8 bg-muted/60"
              >
                <TabsTrigger value="all" className="h-6">
                  All
                </TabsTrigger>

                <TabsTrigger value="unread" className="h-6">
                  Unread
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isError ? (
            <div className="p-4">
              <Alert variant="destructive" role="alert">
                <AlertCircle aria-hidden="true" className="size-4" />
                <AlertTitle>Unable to load notifications</AlertTitle>

                <AlertDescription className="space-y-3">
                  <p>
                    {error instanceof Error
                      ? error.message
                      : 'Something went wrong while loading your inbox.'}
                  </p>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void refetch()}
                  >
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <NotificationList
              notifications={notifications}
              selectedId={selectedNotification?.id ?? null}
              isLoading={isPending}
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              isUnreadFilter={filter === 'unread'}
              onSelect={handleSelect}
              onMarkRead={(id) => actions.markRead.mutate(id)}
              onMarkUnread={(id) => actions.markUnread.mutate(id)}
              onDelete={handleDelete}
              onLoadMore={() => void fetchNextPage()}
            />
          )}
        </section>

        <div
          className={cn(
            'min-h-0 min-w-0 flex-col',
            mobileDetailOpen ? 'flex' : 'hidden md:flex'
          )}
        >
          <NotificationDetail
            notification={selectedNotification}
            onBack={() => setMobileDetailOpen(false)}
            onMarkRead={(id) => actions.markRead.mutate(id)}
            onMarkUnread={(id) => actions.markUnread.mutate(id)}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </main>
  )
}
