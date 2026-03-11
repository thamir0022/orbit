import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common'
import { Request } from 'express'

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>()
    const tenantId = request.headers['x-tenant-id']

    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required')
    }

    return tenantId as string
  }
)
