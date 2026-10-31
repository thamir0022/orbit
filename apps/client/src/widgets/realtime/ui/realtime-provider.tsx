'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useUser } from '@/entities/user/model/user.store'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import { getCurrentUserApi } from '@/entities/user/api/get-current-user.api'
import { notificationKeys } from '@/entities/notification/model/notification.keys'
import { getRealtimeSocket } from '@/shared/lib/realtime/socket'

interface RealtimeProviderProps {
  readonly children: React.ReactNode
}

/**
 * Owns the authenticated application's Socket.IO lifecycle.
 *
 * - Connects once for the active authenticated session.
 * - Reconnects when the workspace token changes.
 * - Invalidates notifications without duplicating server state.
 * - Refreshes expired authentication through Orbit's HTTP client.
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const userId = useUser()?.id
  const workspaceId = useWorkspace()?.id
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const socket = getRealtimeSocket()

    let disposed = false
    let refreshAttempted = false
    let refreshing = false

    /** Synchronizes inbox state after a connection or notification change. */
    const invalidateNotifications = (): void => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      })
    }

    /** Renews HTTP authentication before reconnecting the socket. */
    const refreshAndReconnect = (): void => {
      if (refreshing || disposed) return

      refreshing = true
      socket.disconnect()

      void getCurrentUserApi()
        .then(() => {
          if (!disposed) {
            socket.connect()
          }
        })
        .catch(() => {
          // The existing HTTP auth flow handles expired sessions.
        })
        .finally(() => {
          refreshing = false
        })
    }

    /** Handles a rejected socket handshake at most once per connection cycle. */
    const handleConnectError = (error: Error): void => {
      if (error.message === 'Unauthorized' && !refreshAttempted) {
        refreshAttempted = true
        refreshAndReconnect()
      }
    }

    /** Refreshes the session after the gateway closes an expired connection. */
    const handleAuthExpired = (): void => {
      refreshAttempted = true
      refreshAndReconnect()
    }

    /** Resynchronizes missed events after a successful socket connection. */
    const handleConnect = (): void => {
      refreshAttempted = false
      invalidateNotifications()
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', handleConnectError)
    socket.on('notifications:changed', invalidateNotifications)
    socket.on('realtime:auth-expired', handleAuthExpired)

    socket.connect()

    return () => {
      disposed = true

      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.off('notifications:changed', invalidateNotifications)
      socket.off('realtime:auth-expired', handleAuthExpired)

      socket.disconnect()
    }
  }, [userId, workspaceId, queryClient])

  return <>{children}</>
}
