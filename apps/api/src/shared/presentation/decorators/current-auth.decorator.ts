import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { AuthContext, AuthenticatedRequest } from '../../domain/types'

type AuthContextKey = keyof AuthContext

export const CurrentAuth = createParamDecorator(
  (
    data: AuthContextKey | undefined,
    ctx: ExecutionContext
  ): AuthContext | AuthContext[AuthContextKey] | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()

    const auth = request.auth

    if (!auth || !data) {
      return auth
    }

    return auth[data]
  }
)
