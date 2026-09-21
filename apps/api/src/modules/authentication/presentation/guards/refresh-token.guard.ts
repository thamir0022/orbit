import {
  ITokenGenerator,
  RefreshTokenResult,
  TOKEN_GENERATOR,
} from '@/shared/application/ports/token-generator.interface'
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ISessionManager, SESSION_MANAGER } from '../../application'
import { AuthenticatedRequest } from '@/shared/domain/types'

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_GENERATOR)
    private readonly tokenVerifier: ITokenGenerator,

    @Inject(SESSION_MANAGER)
    private readonly sessionManager: ISessionManager
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException('Refresh token is missing')
    }

    const payload = await this.verifyToken(token)

    const session = await this.sessionManager.getSession(payload.sid)

    if (!session) {
      throw new UnauthorizedException('Session is invalid or expired')
    }

    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid session')
    }

    if (session.sid !== payload.sid) {
      throw new UnauthorizedException('Invalid session')
    }

    if (session.jti !== payload.jti) {
      throw new UnauthorizedException('Refresh token has been revoked')
    }

    request.auth = {
      type: 'refresh',
      userId: payload.sub,
      sessionId: payload.sid,
      tokenId: payload.jti,
    }

    return true
  }

  private async verifyToken(token: string): Promise<RefreshTokenResult> {
    try {
      const payload = await this.tokenVerifier.verifyRefreshToken(token)

      if (!payload) {
        throw new UnauthorizedException('Refresh token is invalid or expired')
      }

      return payload
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error
      }

      throw new UnauthorizedException('Refresh token is invalid or expired')
    }
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    const cookieToken = request.cookies?.refresh_token

    if (cookieToken) {
      return cookieToken
    }

    const authorization = request.headers.authorization

    if (!authorization) {
      return undefined
    }

    const [scheme, token] = authorization.split(' ', 2)

    return scheme === 'Bearer' && token ? token : undefined
  }
}
