import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import { AuthenticatedRequest, RefreshTokenPayload } from '../../domain/types'

export const CurrentIdentity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RefreshTokenPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request['identity']
  }
)
