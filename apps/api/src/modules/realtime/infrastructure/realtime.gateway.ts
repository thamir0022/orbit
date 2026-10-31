import { Logger } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import {
  SocketAuthenticator,
  type RealtimeIdentity,
} from './socket-authenticator.service'
import { RealtimeRoomNames } from './room-names'

/** Authenticated Socket.IO metadata stored on a connection. */
interface RealtimeSocketData {
  identity: RealtimeIdentity
  expiryTimer?: ReturnType<typeof setTimeout>
}

/**
 * Shared Socket.IO gateway for notifications and future collaboration features.
 *
 * - One authenticated connection can join multiple authorized rooms.
 * - User and session rooms are derived from verified server-side identity.
 * - Application modules publish through the RealtimePublisher port.
 */
@WebSocketGateway({ transports: ['websocket'] })
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name)

  @WebSocketServer()
  private server!: Server

  constructor(private readonly authenticator: SocketAuthenticator) {}

  /** Applies authentication before a socket is accepted by the server. */
  afterInit(server: Server): void {
    server.use((client, next) => {
      void this.authenticateConnection(client, next)
    })
  }

  /** Joins rooms that belong to the verified user and session. */
  handleConnection(client: Socket): void {
    const data = client.data as RealtimeSocketData
    const identity = data.identity

    // Only server-verified identifiers control room membership.
    void client.join(RealtimeRoomNames.user(identity.userId))
    void client.join(RealtimeRoomNames.session(identity.sessionId))

    // The client must refresh the HTTP-only access token and reconnect.
    const remainingMs = Math.max(0, identity.tokenExpiresAt - Date.now())
    data.expiryTimer = setTimeout(() => {
      client.emit('realtime:auth-expired')
      client.disconnect(true)
    }, remainingMs)
  }

  /** Cleans up per-socket authentication expiration resources. */
  handleDisconnect(client: Socket): void {
    const data = client.data as Partial<RealtimeSocketData>
    if (data.expiryTimer) clearTimeout(data.expiryTimer)
  }

  /** Publishes a trusted application event to a server-controlled room. */
  emitToRoom(room: string, event: string, payload: unknown): void {
    this.server.to(room).emit(event, payload)
  }

  /** Disconnects all sockets bound to a revoked auth session. */
  disconnectSession(sessionId: string): void {
    this.server.in(RealtimeRoomNames.session(sessionId)).disconnectSockets(true)
  }

  /** Validates authentication while rejecting unauthorized handshakes. */
  private async authenticateConnection(
    client: Socket,
    next: (err?: Error) => void
  ): Promise<void> {
    try {
      const identity = await this.authenticator.authenticate(client)
      const data = client.data as RealtimeSocketData
      data.identity = identity
      next()
    } catch (error) {
      // Do not leak authentication failure details to unauthenticated clients.
      this.logger.debug(
        `Rejected socket connection: ${error instanceof Error ? error.name : 'Error'}`
      )
      next(new Error('Unauthorized'))
    }
  }
}
