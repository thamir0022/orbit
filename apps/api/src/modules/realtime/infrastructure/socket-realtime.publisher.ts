import { Injectable } from '@nestjs/common'
import type { RealtimePublisher } from '../application/ports/realtime-publisher.port'
import { RealtimeGateway } from './realtime.gateway'
import { RealtimeRoomNames } from './room-names'

/**
 * Socket.IO adapter for the shared realtime publisher port.
 *
 * - Delivers ephemeral signals only.
 * - Persistence and retry policies remain the owning module's concern.
 */
@Injectable()
export class SocketRealtimePublisher implements RealtimePublisher {
  constructor(private readonly gateway: RealtimeGateway) {}

  /** Broadcasts to every connected device of one authenticated user. */
  publishToUser(userId: string, event: string, payload: unknown): void {
    this.gateway.emitToRoom(RealtimeRoomNames.user(userId), event, payload)
  }

  /** Broadcasts to a server-authorized application room. */
  publishToRoom(room: string, event: string, payload: unknown): void {
    this.gateway.emitToRoom(room, event, payload)
  }

  /** Disconnects all active sockets for a revoked auth session. */
  disconnectSession(sessionId: string): void {
    this.gateway.disconnectSession(sessionId)
  }
}
