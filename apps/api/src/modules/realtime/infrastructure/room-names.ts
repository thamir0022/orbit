/**
 * Centralizes server-controlled Socket.IO room naming.
 *
 * - Never accept room membership from clients without authorization.
 * - Chat and project room joins will be implemented by their own modules.
 */
export class RealtimeRoomNames {
  /** Room shared by all active sockets belonging to a user. */
  static user(userId: string): string {
    return `user:${userId}`
  }

  /** Room identifying sockets belonging to one authenticated session. */
  static session(sessionId: string): string {
    return `session:${sessionId}`
  }
}
