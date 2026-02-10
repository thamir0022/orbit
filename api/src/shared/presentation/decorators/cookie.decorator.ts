import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

interface RequestWithCookies extends Request {
  cookies: Record<string, string>
}

export const Cookie = createParamDecorator(
  (
    key: string | undefined,
    ctx: ExecutionContext
  ): string | Record<string, string> | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithCookies>()

    if (!request.cookies) return undefined

    return key ? request.cookies[key] : request.cookies
  }
)
