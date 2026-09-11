import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator'
import {
  type IPermissionCacheManager,
  PERMISSION_CACHE_MANAGER,
} from '@/modules/authorization/application/repositories/permission-cache-manager.interface'
import { AuthenticatedRequest } from '@/shared/domain/types'

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name)

  constructor(
    private reflector: Reflector,
    @Inject(PERMISSION_CACHE_MANAGER)
    private readonly permissionCacheManager: IPermissionCacheManager
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extract required permissions from the Route/Controller metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    )

    // Fast-Fail: If the route isn't protected by the decorator, let them pass
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const userPayload = request.identity

    // Fast-Fail: Defensive check to ensure the AuthGuard ran first
    if (!userPayload || !userPayload.jti) {
      this.logger.warn(
        'PermissionsGuard executed without a valid JTI in the request payload.'
      )
      throw new ForbiddenException('Invalid or missing authentication session.')
    }

    // 2. The Single Network Hop: Fetch ALL permissions for this token from Redis
    const cachedPermissionsArray =
      await this.permissionCacheManager.getPermissions(userPayload.jti)

    // Fast-Fail: Session expired in Redis or user was forcefully demoted
    if (!cachedPermissionsArray || cachedPermissionsArray.length === 0) {
      throw new ForbiddenException(
        'Your access permissions have expired or been revoked.'
      )
    }

    // 3. The God-Mode Check
    if (cachedPermissionsArray.includes('*')) {
      return true // Platform Admin instantly bypasses all granular checks
    }

    // 4. The CPU Optimization: Convert the array to a JS Set for O(1) lookups
    const userPermissionSet = new Set(cachedPermissionsArray)

    // 5. The Verification: Ensure the user has ALL required permissions
    const hasAllPermissions = requiredPermissions.every((requiredPerm) =>
      userPermissionSet.has(requiredPerm)
    )

    if (!hasAllPermissions) {
      this.logger.debug(
        `User ${userPayload.sub} denied access. Missing required permissions.`
      )
      throw new ForbiddenException(
        'You do not have the required clearance to perform this action.'
      )
    }

    return true
  }
}
