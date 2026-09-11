import { IBaseRepository } from '@/shared/application'

import { UserRole } from '../../domain/entities/user-role.entity'
import { UserRoleId } from '../../domain/value-objects/user-role-id.vo'
import { UserId } from '@/modules/user/domain'
import { RoleId } from '../../domain/value-objects/role-id.vo'

export interface JoinedUserRoleResult {
  id: string
  userId: string
  roleId: string
  roleDetails: {
    id: string
    name: string
    scope: string
    status: string
    isPredefined: boolean
  }
}

export interface UserRoleRepository extends IBaseRepository<
  UserRole,
  UserRoleId
> {
  findByUserId(userId: UserId): Promise<UserRole | null>
  findRoleDetailsByUserId(userId: UserId): Promise<JoinedUserRoleResult | null>
  exists(userId: UserId, roleId?: RoleId): Promise<boolean>
}

export const USER_ROLE_REPOSITORY = Symbol('UserRoleRepository')
