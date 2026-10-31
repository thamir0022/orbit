'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox } from 'lucide-react'

import { useUnreadNotificationCount } from '@/entities/notification/api/use-unread-notification-count'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar'

interface NavInboxProps {
  readonly workspaceSlug: string
}

/**
 * Sidebar navigation item for the account-wide notification inbox.
 *
 * - Uses the active workspace route for navigation.
 * - Displays a cached global unread count.
 * - Keeps unread status accessible to screen readers.
 */
export function NavInbox({ workspaceSlug }: NavInboxProps) {
  const pathname = usePathname()

  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  const url = `/${workspaceSlug}/inbox`
  const isActive = pathname === url

  const countLabel = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isActive} tooltip="Inbox">
            <Link
              href={url}
              aria-current={isActive ? 'page' : undefined}
              aria-label={
                unreadCount > 0
                  ? `Inbox, ${unreadCount} unread notifications`
                  : 'Inbox'
              }
            >
              <Inbox aria-hidden="true" />
              <span>Inbox</span>
            </Link>
          </SidebarMenuButton>

          {unreadCount > 0 && (
            <SidebarMenuBadge aria-hidden="true">{countLabel}</SidebarMenuBadge>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
