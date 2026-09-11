import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common'
import { AuthenticatedRequest } from '../../../domain/types'
import {
  TOKEN_GENERATOR,
  type ITokenGenerator,
} from '../../../application/ports/token-generator.interface'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_GENERATOR)
    private readonly jwtService: ITokenGenerator
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractToken(request)

    console.log('ACCESS TOKEN : ', token)

    if (!token) {
      throw new UnauthorizedException('Workspace access token is missing')
    }

    try {
      const payload = await this.jwtService.verifyAccessToken(token)

      // Attach the workspace context to the request object
      if (payload) request['tenant'] = payload
      return true
    } catch (error) {
      throw new ForbiddenException(
        `Workspace token is invalid, expired, or unauthorized, ${error instanceof Error && error.message}`
      )
    }
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    // 1. Check cookies
    if (request.cookies && request.cookies['access_token']) {
      return request.cookies['access_token'] as string
    }

    // 2. Fallback to custom header or Authorization Header
    if (request.headers['x-tenant-token']) {
      return request.headers['x-tenant-token'] as string
    }

    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
