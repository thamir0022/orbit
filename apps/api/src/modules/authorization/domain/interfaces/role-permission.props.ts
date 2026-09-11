import { PermissionId } from '../value-objects/permission-id.vo'
import { RoleId } from '../value-objects/role-id.vo'
import { RolePermissionId } from '../value-objects/role-permission-id.vo'

export interface RolePermissionProps {
  id: RolePermissionId
  roleId: RoleId
  permissionId: PermissionId
  createdAt: Date
}
