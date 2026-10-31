'use client'

import {
  AtSign,
  Bell,
  Check,
  CheckCheck,
  Inbox,
  ListTodo,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import type { Notification } from '@/entities/notification/model/notification.types'

import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Skeleton } from '@/shared/ui/skeleton'

interface NotificationListProps {
  readonly notifications: readonly Notification[]
  readonly selectedId: string | null
  readonly isLoading: boolean
  readonly hasNextPage: boolean
  readonly isFetchingNextPage: boolean
  readonly isUnreadFilter: boolean
  readonly onSelect: (notification: Notification) => void
  readonly onMarkRead: (id: string) => void
  readonly onMarkUnread: (id: string) => void
  readonly onDelete: (id: string) => void
  readonly onLoadMore: () => void
}

/** Returns a compact description for the notification list. */
function getNotificationExcerpt(message: string): string {
  return message
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}

/** Formats timestamps while tolerating malformed server data. */
function getRelativeTime(value: string): string {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? ''
    : formatDistanceToNow(date, { addSuffix: true })
}

/** Renders an appropriate icon for system-generated notifications. */
function getNotificationIcon(type: string) {
  const className = 'size-4 text-muted-foreground'

  if (type === 'system.welcome') {
    return <Sparkles className={className} aria-hidden="true" />
  }

  if (type.includes('mention')) {
    return <AtSign className={className} aria-hidden="true" />
  }

  if (type.includes('comment')) {
    return <MessageSquare className={className} aria-hidden="true" />
  }

  if (type.includes('work_item')) {
    return <ListTodo className={className} aria-hidden="true" />
  }

  if (type.includes('security') || type.includes('sign_in')) {
    return <ShieldCheck className={className} aria-hidden="true" />
  }

  return <Bell className={className} aria-hidden="true" />
}

/**
 * Displays a notification avatar or event icon.
 *
 * - Shows actor identity when available.
 * - Uses an event icon for system notifications.
 */
function NotificationAvatar({
  notification,
}: {
  readonly notification: Notification
}) {
  if (!notification.actor) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
        {getNotificationIcon(notification.type)}
      </div>
    )
  }

  return (
    <Avatar className="size-9">
      <AvatarImage src={notification.actor.avatarUrl ?? undefined} alt="" />
      <AvatarFallback className="text-xs font-medium">
        {notification.actor.displayName.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

interface NotificationRowProps {
  readonly notification: Notification
  readonly selected: boolean
  readonly onSelect: () => void
  readonly onMarkRead: () => void
  readonly onMarkUnread: () => void
  readonly onDelete: () => void
}

/**
 * Accessible notification row with independent selection and actions.
 *
 * - Keeps the primary selection button separate from action controls.
 * - Displays unread state visually and through accessible text.
 */
function NotificationRow({
  notification,
  selected,
  onSelect,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: NotificationRowProps) {
  const unread = notification.readAt === null

  return (
    <li
      className={cn(
        'group relative border-b border-border/50 last:border-b-0',
        selected && 'bg-accent/60'
      )}
    >
      <div className="flex min-w-0 items-start gap-1 pr-2">
        <button
          type="button"
          onClick={onSelect}
          aria-current={selected ? 'true' : undefined}
          aria-label={`${notification.title}, ${unread ? 'unread' : 'read'}`}
          className={cn(
            'flex min-w-0 flex-1 items-start gap-3 px-4 py-3.5 text-left',
            'transition-colors hover:bg-accent/40',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring'
          )}
        >
          <NotificationAvatar notification={notification} />

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-sm',
                  unread ? 'font-semibold' : 'font-medium'
                )}
              >
                {notification.title}
              </span>

              {unread && (
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              )}
            </div>

            <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
              {getNotificationExcerpt(notification.message)}
            </p>

            <time
              dateTime={notification.createdAt}
              className="block text-[11px] text-muted-foreground/80"
            >
              {getRelativeTime(notification.createdAt)}
            </time>
          </div>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Actions for ${notification.title}`}
              className="mt-3 shrink-0 opacity-70 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {unread ? (
              <DropdownMenuItem onSelect={onMarkRead}>
                <Check aria-hidden="true" />
                Mark as read
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={onMarkUnread}>
                <CheckCheck aria-hidden="true" />
                Mark as unread
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 aria-hidden="true" />
              Delete notification
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}

/**
 * Scrollable notification inbox list.
 *
 * - Supports cursor pagination.
 * - Handles loading, empty, and populated states.
 * - Exposes accessible selection and notification actions.
 */
export function NotificationList({
  notifications,
  selectedId,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  isUnreadFilter,
  onSelect,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onLoadMore,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading notifications"
        className="space-y-4 p-4"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="size-9 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <Empty className="h-full border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox aria-hidden="true" />
          </EmptyMedia>

          <EmptyTitle>
            {isUnreadFilter ? "You're all caught up" : 'Your inbox is empty'}
          </EmptyTitle>

          <EmptyDescription>
            {isUnreadFilter
              ? 'No unread notifications need your attention.'
              : 'Updates about your projects, teams, and work will appear here.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <ul aria-label="Notifications">
        {notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            selected={notification.id === selectedId}
            onSelect={() => onSelect(notification)}
            onMarkRead={() => onMarkRead(notification.id)}
            onMarkUnread={() => onMarkUnread(notification.id)}
            onDelete={() => onDelete(notification.id)}
          />
        ))}
      </ul>

      {hasNextPage && (
        <div className="flex justify-center border-t p-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            isLoading={isFetchingNextPage}
            onClick={onLoadMore}
          >
            Load more
          </Button>
        </div>
      )}
    </ScrollArea>
  )
}
