import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { AuthenticatedUser } from '@/modules/auth/application/interfaces/authenticated-user.interface'

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.user
  }
)
