import { AggregateRoot } from '@/shared/domain'
import { UserId } from '@/modules/user/domain'
import { RoleId } from '../value-objects/role-id.vo'
import { UserRoleId } from '../value-objects/user-role-id.vo'
import { UserRoleProps } from '../interfaces/user-role.props'
import { CreateUserRoleProps } from '../interfaces/create-user-role.props'

export class UserRole extends AggregateRoot<UserRoleId> {
  private readonly _userId: UserId

  private readonly _roleId: RoleId

  private readonly _createdAt: Date

  private constructor(props: UserRoleProps) {
    super(props.id)

    this._userId = props.userId
    this._roleId = props.roleId
    this._createdAt = props.createdAt
  }

  static create(props: CreateUserRoleProps): UserRole {
    return new UserRole({
      id: UserRoleId.create(),
      userId: props.userId,
      roleId: props.roleId,
      createdAt: new Date(),
    })
  }

  static reconstitute(props: UserRoleProps): UserRole {
    return new UserRole(props)
  }

  get userRoleId(): UserRoleId {
    return this._id
  }

  get userId(): UserId {
    return this._userId
  }

  get roleId(): RoleId {
    return this._roleId
  }

  get createdAt(): Date {
    return this._createdAt
  }
}
