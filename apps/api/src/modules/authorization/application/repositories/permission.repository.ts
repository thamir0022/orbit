import { IBaseRepository } from '@/shared/application'
import { Permission } from '../../domain/entities/permission.entity'
import { PermissionKey } from '../../domain/value-objects/permission-key.vo'
import { PermissionId } from '../../domain/value-objects/permission-id.vo'
import { PermissionStatus } from '../../domain/enums/permission-status.enum'
import { PermissionAction } from '../../domain/enums/permission-action.enum'
import { PermissionResource } from '../../domain/enums/permission-resource.enum'
import { RoleId } from '../../domain/value-objects/role-id.vo'

export interface FindAllPermissionQuery {
  readonly key?: PermissionKey
  readonly action?: PermissionAction
  readonly resourse?: PermissionResource
  readonly status?: PermissionStatus
}

export interface PermissionRepository extends IBaseRepository<
  Permission,
  string
> {
  findByKey(key: PermissionKey): Promise<Permission | null>
  findAll(query: FindAllPermissionQuery): Promise<Permission[]>
  findByIds(permissionIds: PermissionId[]): Promise<Permission[]>
  findKeysByRoleId(roleId: RoleId): Promise<string[]>
}

export const PERMISSION_REPOSITORY = Symbol('PermissionRepository')
