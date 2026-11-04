import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

import type { AuthenticatedRequest } from '@/shared/domain/types'
import type { FileActor } from '../../../application/ports/file-authorization.port'

/**
 * Extracts the authenticated file actor from Orbit's access-token context.
 */
export const FilePrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): FileActor => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    const auth = request.auth

    if (auth?.type !== 'access' || !auth.userId) {
      throw new UnauthorizedException('Authentication required')
    }

    return {
      userId: auth.userId,
      workspaceId: auth.workspaceId ?? null,
    }
  }
)
