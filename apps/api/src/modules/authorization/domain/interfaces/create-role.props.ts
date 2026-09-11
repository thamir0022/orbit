import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain/value-objects/workspace-id.vo'
import { RoleName } from '../value-objects/role-name.vo'
import { RoleScope } from '../enums/role-scope.enum'

export interface CreateRoleProps {
  workspaceId?: WorkspaceId
  name: RoleName
  description?: string
  isPredefined: boolean
  scope: RoleScope
  createdBy?: UserId
}
