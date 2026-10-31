/**
 * Transport-independent port for publishing ephemeral realtime signals.
 *
 * - Infrastructure manages authenticated Socket.IO rooms.
 * - Application code remains unaware of the underlying socket server.
 */
export interface RealtimePublisher {
  publishToUser(userId: string, event: string, payload: unknown): void
  publishToRoom(room: string, event: string, payload: unknown): void
  disconnectSession(sessionId: string): void
}

/** Injection token for realtime publishers. */
export const REALTIME_PUBLISHER = Symbol('RealtimePublisher')
