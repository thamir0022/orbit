'use client'

import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

/**
 * Returns the shared authenticated Socket.IO client.
 *
 * - One connection is shared across application features.
 * - Cookies provide authentication during the handshake.
 * - Connection lifecycle is controlled by the RealtimeProvider.
 */
export function getRealtimeSocket(): Socket {
  if (socket) return socket

  const apiUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:5000/api/v1'

  const origin = new URL(apiUrl).origin

  socket = io(origin, {
    autoConnect: false,
    transports: ['websocket'],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    timeout: 10_000,
  })

  return socket
}
