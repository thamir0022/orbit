import { Inject, Injectable, Logger } from '@nestjs/common'
import { type Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { type IPermissionCacheManager } from '../../application/repositories/permission-cache-manager.interface'
import { type IRedisConfig, REDIS_CONFIG } from '@/shared/infrastructure'

@Injectable()
export class RedisPermissionCacheManager implements IPermissionCacheManager {
  private readonly logger = new Logger(RedisPermissionCacheManager.name)
  private static readonly PERMISSION_PREFIX = 'authz:role-permissions:v1:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,

    @Inject(REDIS_CONFIG)
    private readonly config: IRedisConfig
  ) {}

  async cachePermissions(roleId: string, permissions: string[]): Promise<void> {
    if (!permissions || permissions.length === 0) {
      this.logger.debug(
        `Skipping cache for ${roleId}: No permissions provided.`
      )
      return
    }

    const ttl = this.config.permissionTTL

    try {
      await this.cache.set(this.cacheKey(roleId), permissions, ttl)
    } catch (error) {
      this.logger.error(
        `Failed to cache permissions for RoleId: ${roleId}`,
        error
      )
      throw error // Fail secure: If cache goes down, tokens cannot be minted
    }
  }

  async getPermissions(roleId: string): Promise<string[] | null> {
    try {
      const permissions = await this.cache.get<string[]>(this.cacheKey(roleId))
      return permissions ?? null
    } catch (error) {
      this.logger.error(
        `Failed to retrieve permissions for JTI: ${roleId}`,
        error
      )
      return null // Fail secure: Assume no permissions if cache is unreachable
    }
  }

  async revokePermissions(roleId: string): Promise<void> {
    try {
      await this.cache.del(this.cacheKey(roleId))
    } catch (error) {
      this.logger.error(
        `Failed to revoke permissions for Role Id: ${roleId}`,
        error
      )
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Private Helpers                                                            */
  /* -------------------------------------------------------------------------- */

  private cacheKey(roleId: string): string {
    return `${RedisPermissionCacheManager.PERMISSION_PREFIX}${roleId}`
  }
}
