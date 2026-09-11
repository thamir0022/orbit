import { UserId } from '@/modules/user/domain'

import { RoleId } from '../value-objects/role-id.vo'

export interface CreateUserRoleProps {
  userId: UserId

  roleId: RoleId
}
