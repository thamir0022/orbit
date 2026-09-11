import { UserId } from '@/modules/user/domain'

import { UserRole } from '../../domain/entities/user-role.entity'

import { UserRoleProps } from '../../domain/interfaces/user-role.props'

import { RoleId } from '../../domain/value-objects/role-id.vo'
import { UserRoleId } from '../../domain/value-objects/user-role-id.vo'

import { type UserRoleDocument } from '../../infrastructure/schemas/user-role.schema'

export class UserRoleMapper {
  /**
   * Map domain entity to persistence model
   */
  static toPersistence(userRole: UserRole): Partial<UserRoleDocument> {
    return {
      id: userRole.userRoleId.value,

      userId: userRole.userId.value,

      roleId: userRole.roleId.value,

      createdAt: userRole.createdAt,
    }
  }

  /**
   * Map persistence model to domain entity
   */
  static toDomain(document: UserRoleDocument): UserRole {
    const props: UserRoleProps = {
      id: UserRoleId.fromString(document.id),

      userId: UserId.fromString(document.userId),

      roleId: RoleId.fromString(document.roleId),

      createdAt: document.createdAt,
    }

    return UserRole.reconstitute(props)
  }
}
