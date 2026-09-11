export interface IPermissionCacheManager {
  /**
   * Caches an array of permissions tied to a specific Access Token (JTI).
   * @param jti The JWT Token ID
   * @param permissions Array of permission keys (e.g., ['projects:read', 'billing:write'])
   * @param ttlInMilliseconds The exact time-to-live matching the token expiry
   */
  cachePermissions(roleId: string, permissions: string[]): Promise<void>

  /**
   * Retrieves all cached permissions for a specific Access Token.
   * @param jti The JWT Token ID
   * @returns Array of permissions, or null if expired/invalid
   */
  getPermissions(roleId: string): Promise<string[] | null>

  /**
   * Forcibly revokes an Access Token's permissions before natural expiry.
   * Useful for instant RBAC demotions.
   * @param jti The JWT Token ID
   */
  revokePermissions(roleId: string): Promise<void>
}

export const PERMISSION_CACHE_MANAGER = Symbol('PERMISSION_CACHE_MANAGER')
