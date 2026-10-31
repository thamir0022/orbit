'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react'

import type {
  Notification,
  NotificationAction,
} from '@/entities/notification/model/notification.types'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { MarkdownViewer } from '@/shared/ui/markdown/markdown-viewer'

interface NotificationDetailProps {
  readonly notification: Notification | null
  readonly onBack: () => void
  readonly onMarkRead: (id: string) => void
  readonly onMarkUnread: (id: string) => void
  readonly onDelete: (id: string) => void
}

/** Resolves an optional structured notification action to a URL. */
function getActionHref(action: NotificationAction): string | null {
  if (action.resource) {
    const resourceType = action.resource.type.replaceAll('_', '-')

    return `/r/${encodeURIComponent(resourceType)}/${encodeURIComponent(action.resource.id)}`
  }

  if (!action.href) return null

  if (
    action.href.startsWith('/') &&
    !action.href.startsWith('//') &&
    !action.href.includes('\\')
  ) {
    return action.href
  }

  try {
    const url = new URL(action.href)

    return url.protocol === 'https:' ? action.href : null
  } catch {
    return null
  }
}

/** Formats the full notification timestamp for display. */
function formatTimestamp(value: string): string {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Unknown date' : format(date, 'PPP p')
}

/**
 * Detailed view of a selected inbox notification.
 *
 * - Uses Streamdown to render rich Markdown.
 * - Supports primary resource and metadata-action navigation.
 * - Provides accessible read-state and deletion controls.
 */
export function NotificationDetail({
  notification,
  onBack,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: NotificationDetailProps) {
  if (!notification) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <Bell className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>

        <h2 className="text-sm font-medium">Select a notification</h2>
        <p className="max-w-xs text-xs leading-5 text-muted-foreground">
          Choose an update from your inbox to view its details.
        </p>
      </div>
    )
  }

  const unread = notification.readAt === null

  return (
    <section
      aria-label={`Notification: ${notification.title}`}
      className="flex h-full min-h-0 flex-col"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft aria-hidden="true" />
          Inbox
        </Button>

        <span className="hidden text-xs font-medium text-muted-foreground md:inline">
          Notification details
        </span>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={
              unread
                ? 'Mark notification as read'
                : 'Mark notification as unread'
            }
            onClick={() =>
              unread
                ? onMarkRead(notification.id)
                : onMarkUnread(notification.id)
            }
          >
            {unread ? (
              <Check aria-hidden="true" />
            ) : (
              <CheckCheck aria-hidden="true" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete notification"
            onClick={() => onDelete(notification.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-5 py-6 sm:px-8 sm:py-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {notification.actor ? (
                <Avatar size="sm">
                  <AvatarImage
                    src={notification.actor.avatarUrl ?? undefined}
                    alt=""
                  />
                  <AvatarFallback>
                    {notification.actor.displayName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                  <Bell className="size-3.5" aria-hidden="true" />
                </div>
              )}

              <span className="text-xs font-medium">
                {notification.actor?.displayName ?? 'Orbit'}
              </span>

              <span className="text-xs text-muted-foreground">·</span>

              <time
                dateTime={notification.createdAt}
                className="text-xs text-muted-foreground"
              >
                {formatTimestamp(notification.createdAt)}
              </time>
            </div>

            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {notification.title}
            </h2>
          </div>

          <Separator />

          <article aria-label="Notification content">
            <MarkdownViewer content={notification.message} />
          </article>

          {notification.resource && (
            <Link
              href={notification.resource.href}
              className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Related {notification.resource.type.replaceAll('_', ' ')}
                </p>

                <p className="truncate text-sm font-medium">
                  {notification.resource.label ?? 'Open resource'}
                </p>
              </div>

              <ArrowUpRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          )}

          {notification.metadata?.actions &&
            notification.metadata.actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {notification.metadata.actions.map((action, index) => {
                  const href = getActionHref(action)

                  if (!href) return null

                  return href.startsWith('/') ? (
                    <Button
                      key={`${action.label}-${index}`}
                      asChild
                      size="sm"
                      variant="outline"
                    >
                      <Link href={href}>
                        {action.label}
                        <ArrowUpRight aria-hidden="true" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      key={`${action.label}-${index}`}
                      asChild
                      size="sm"
                      variant="outline"
                    >
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {action.label}
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    </Button>
                  )
                })}
              </div>
            )}
        </div>
      </div>
    </section>
  )
}
