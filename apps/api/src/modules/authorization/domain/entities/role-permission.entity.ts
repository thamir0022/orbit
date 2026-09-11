import { RoleId } from '../value-objects/role-id.vo'
import { PermissionId } from '../value-objects/permission-id.vo'
import { RolePermissionProps } from '../interfaces/role-permission.props'
import { RolePermissionId } from '../value-objects/role-permission-id.vo'
import { CreateRolePermissionProps } from '../interfaces/create-role-permission.props'

export class RolePermission {
  private readonly _id: RolePermissionId
  private readonly _roleId: RoleId
  private readonly _permissionId: PermissionId
  private readonly _createdAt: Date

  private constructor(props: RolePermissionProps) {
    this._id = props.id
    this._roleId = props.roleId
    this._permissionId = props.permissionId
    this._createdAt = props.createdAt
  }

  static create(props: CreateRolePermissionProps): RolePermission {
    const now = new Date()

    return new RolePermission({
      id: RolePermissionId.create(),
      roleId: props.roleId,
      permissionId: props.permissionId,
      createdAt: now,
    })
  }

  static reconstitute(props: RolePermissionProps): RolePermission {
    return new RolePermission(props)
  }

  get id(): RolePermissionId {
    return this._id
  }

  get roleId(): RoleId {
    return this._roleId
  }

  get permissionId(): PermissionId {
    return this._permissionId
  }

  get createdAt(): Date {
    return this._createdAt
  }
}
