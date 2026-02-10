import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { User } from '@/modules/user/domain'

interface AuthenticatedRequest extends Request {
  user: User
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.user
  }
)
