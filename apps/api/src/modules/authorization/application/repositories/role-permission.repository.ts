import { RoleId } from '../../domain/value-objects/role-id.vo'
import { PermissionId } from '../../domain/value-objects/permission-id.vo'
import { RolePermission } from '../../domain/entities/role-permission.entity'
import { ITransactionOptions } from '@/shared/application'

export interface RolePermissionRepository {
  findPermissionsByRoleId(roleId: RoleId): Promise<string[]>
  findPermissionKeysByRoleId(roleId: string): Promise<string[]>
  // findPermissionKeysByUserId(
  //   userId: UserId,
  //   workspaceId: WorkspaceId
  // ): Promise<string[]>
  save(
    rolePermission: RolePermission,
    options?: ITransactionOptions
  ): Promise<void>
  saveMany(
    rolePermission: RolePermission[],
    options?: ITransactionOptions
  ): Promise<void>
  exists(roleId: RoleId, permissionId: PermissionId): Promise<boolean>
  delete(roleId: RoleId, permissionId: PermissionId): Promise<void>
  deleteMany(roleId: RoleId, options?: ITransactionOptions): Promise<void>
  replacePermissions(
    roleId: string,
    permissionIds: string[],
    options?: ITransactionOptions
  ): Promise<void>
}

export const ROLE_PERMISSION_REPOSITORY = Symbol('RolePermissionRepository')
