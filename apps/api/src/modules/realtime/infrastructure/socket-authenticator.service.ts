import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Socket } from 'socket.io'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '@/modules/authentication/application/services/auth.service.interface'
import { APP_CONFIG, type IAppConfig } from '@/shared/infrastructure'

/** Validated identity associated with one socket connection. */
export interface RealtimeIdentity {
  readonly userId: string
  readonly sessionId: string
  readonly tokenExpiresAt: number
}

/**
 * Authenticates Socket.IO handshakes against Orbit's existing auth service.
 *
 * - Uses the same access token and Redis session rules as HTTP.
 * - Validates browser Origin to prevent cross-site WebSocket hijacking.
 * - Never trusts a client-provided user ID or room name.
 */
@Injectable()
export class SocketAuthenticator {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    @Inject(APP_CONFIG) private readonly config: IAppConfig
  ) {}

  /** Resolves the authenticated identity for a socket handshake. */
  async authenticate(client: Socket): Promise<RealtimeIdentity> {
    this.assertAllowedOrigin(client)

    const token = this.extractToken(client)
    if (!token) throw new UnauthorizedException('Missing access token')

    const payload = await this.authService.verifyAccessToken(token)
    if (
      !payload?.sub ||
      !payload.sid ||
      !payload.jti ||
      !Number.isFinite(payload.exp) ||
      payload.exp * 1000 <= Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired access token')
    }

    const session = await this.authService.getSession(payload.sid)
    if (
      !session ||
      session.userId !== payload.sub ||
      session.sid !== payload.sid ||
      new Date(session.expiresAt).getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired session')
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
      tokenExpiresAt: payload.exp * 1000,
    }
  }

  /** Accepts trusted browser origins, or origin-less native clients with bearer auth. */
  private assertAllowedOrigin(client: Socket): void {
    const origin = client.handshake.headers.origin
    if (origin && !this.config.corsOrigins.includes(origin)) {
      throw new UnauthorizedException('Untrusted socket origin')
    }
    if (!origin && !this.getHandshakeAccessToken(client)) {
      throw new UnauthorizedException('Origin or bearer token required')
    }
  }

  /** Reads the HTTP-only cookie first, then explicit native-client bearer auth. */
  private extractToken(client: Socket): string | null {
    const rawCookies = client.handshake.headers.cookie
    if (rawCookies) {
      const cookie = rawCookies
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('access_token='))
      if (cookie) {
        try {
          return decodeURIComponent(cookie.slice('access_token='.length))
        } catch {
          return null
        }
      }
    }
    return this.getHandshakeAccessToken(client)
  }

  /** Supports clients that explicitly supply an access token in auth data. */
  private getHandshakeAccessToken(client: Socket): string | null {
    const value: unknown = client.handshake.auth?.accessToken
    return typeof value === 'string' && value.length > 0 ? value : null
  }
}
