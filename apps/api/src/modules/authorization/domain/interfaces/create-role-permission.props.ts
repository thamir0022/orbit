import { PermissionId } from '../value-objects/permission-id.vo'
import { RoleId } from '../value-objects/role-id.vo'

export interface CreateRolePermissionProps {
  roleId: RoleId
  permissionId: PermissionId
}
