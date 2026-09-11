import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthenticatedRequest } from '../../../domain/types'
import {
  type ITokenGenerator,
  TOKEN_GENERATOR,
} from '../../../application/ports/token-generator.interface'

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_GENERATOR)
    private readonly jwtService: ITokenGenerator
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractToken(request)

    console.log('REFRESH TOKEN : ', token)

    if (!token) {
      throw new UnauthorizedException('Refresh Token is missing')
    }

    try {
      // Verifies using the globally configured public key / secret
      const payload = await this.jwtService.verifyRefreshToken(token)

      // Attach the payload to the request object for custom decorators
      if (payload) request['identity'] = payload
      return true
    } catch (error: unknown) {
      throw new UnauthorizedException(
        `Refresh Token is invalid or expired, ${error instanceof Error && error.message}`
      )
    }
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    // 1. Check cookies (Standard for Web/Next.js architectures)
    if (request.cookies && request.cookies['refresh_token']) {
      return request.cookies['refresh_token'] as string
    }

    // 2. Fallback to Authorization Header (Standard for mobile/public APIs)
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
