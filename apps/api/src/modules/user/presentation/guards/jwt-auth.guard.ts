import { AccessTokenPayload } from '@/modules/auth/application'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException('No token provided')
    }

    const [, token] = authHeader.split(' ')

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token)

      request.user = {
        id: payload.sub,
        sessionId: payload.sid,
        jti: payload.jti,
      }

      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
