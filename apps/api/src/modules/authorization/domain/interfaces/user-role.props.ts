import { UserId } from '@/modules/user/domain'

import { RoleId } from '../value-objects/role-id.vo'
import { UserRoleId } from '../value-objects/user-role-id.vo'

export interface UserRoleProps {
  id: UserRoleId
  userId: UserId
  roleId: RoleId
  createdAt: Date
}
