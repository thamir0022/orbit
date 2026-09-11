import { SetMetadata } from '@nestjs/common'

// Define a strict key to avoid typos
export const PERMISSIONS_KEY = 'required_permissions'

/**
 * Enterprise Decorator: Locks down a route to specific RBAC permissions.
 * The user must possess ALL listed permissions to access the route.
 * * @example @RequirePermissions('role:create', 'role:read')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)
