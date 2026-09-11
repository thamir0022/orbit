import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import { AuthenticatedRequest, AccessTokenPayload } from '../../domain/types'

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request['tenant']
  }
)
