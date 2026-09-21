import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { AuthenticatedRequest } from '@/shared/domain/types'
import { IS_PUBLIC_KEY } from '@/shared/presentation/decorators/public.decorator'

import {
  AUTH_SERVICE,
  type IAuthService,
} from '../../application/services/auth.service.interface'
import { SessionData } from '../../application'
import { AccessTokenResult } from '@/shared/application/ports/token-generator.interface'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private static readonly SESSION_TOUCH_INTERVAL_MS = 60_000

  private readonly logger = new Logger(AccessTokenGuard.name)

  constructor(
    private readonly reflector: Reflector,

    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) return true

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException('Access token is missing')
    }

    const payload = await this.verifyToken(token)

    const session = await this.authService.getSession(payload.sid)

    if (!session) {
      throw new UnauthorizedException('Session has expired')
    }

    this.validateSession(payload, session)

    await this.touchSessionIfRequired(session)

    request.auth = {
      type: 'access',
      userId: payload.sub,
      sessionId: payload.sid,
      workspaceId: payload.tid,
      tokenId: payload.jti,
    }

    return true
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    )
  }

  private async verifyToken(token: string): Promise<AccessTokenResult> {
    try {
      const payload = await this.authService.verifyAccessToken(token)

      if (!payload?.sub || !payload?.sid || !payload?.jti) {
        throw new UnauthorizedException('Invalid access token')
      }

      return payload
    } catch {
      throw new UnauthorizedException('Invalid or expired access token')
    }
  }

  private validateSession(
    payload: AccessTokenResult,
    session: SessionData
  ): void {
    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid session')
    }

    if (session.sid !== payload.sid) {
      throw new UnauthorizedException('Invalid session')
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session has expired')
    }
  }

  private async touchSessionIfRequired(session: SessionData): Promise<void> {
    const now = Date.now()
    const lastActiveAt = new Date(session.lastActiveAt).getTime()

    if (now - lastActiveAt >= AccessTokenGuard.SESSION_TOUCH_INTERVAL_MS) {
      await this.authService.touchSession(session.sid)
    }
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    const cookieToken = request.cookies.access_token

    if (cookieToken) return cookieToken

    const tenantToken = request.headers['x-tenant-token']

    if (typeof tenantToken === 'string') return tenantToken

    const authorization = request.headers.authorization

    if (!authorization) return undefined

    const [scheme, token] = authorization.split(' ')

    return scheme === 'Bearer' ? token : undefined
  }
}
