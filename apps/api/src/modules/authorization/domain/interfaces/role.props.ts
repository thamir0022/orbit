import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain/value-objects/workspace-id.vo'

import { RoleId } from '../value-objects/role-id.vo'
import { RoleName } from '../value-objects/role-name.vo'
import { RoleStatus } from '../enums/role-status.enum'
import { RoleScope } from '../enums/role-scope.enum'

export interface RoleProps {
  id: RoleId
  workspaceId?: WorkspaceId
  name: RoleName
  description?: string
  scope: RoleScope
  isPredefined: boolean
  status: RoleStatus
  createdBy?: UserId
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
