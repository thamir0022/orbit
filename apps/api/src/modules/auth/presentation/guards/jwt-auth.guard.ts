// src/modules/auth/infrastructure/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { IS_PUBLIC_KEY } from '@/shared/presentation/decorators/public.decorator'
import { AccessTokenResult } from '../../application'
import { JWT_ACCESS } from '../../application/constants/auth.constant'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JWT_ACCESS) private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true // Bypass authentication
    }

    // 2. Standard JWT logic proceeds here...
    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.headers.authorization

    if (!authHeader) throw new UnauthorizedException('No token provided')

    const [, token] = authHeader.split(' ')

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenResult>(token)
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
