import { AggregateRoot } from '@/shared/domain'
import { RoleStatus } from '../enums/role-status.enum'
import { RoleId } from '../value-objects/role-id.vo'
import { RoleName } from '../value-objects/role-name.vo'
import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'
import { RoleProps } from '../interfaces/role.props'
import { CreateRoleProps } from '../interfaces/create-role.props'
import { RoleScope } from '../enums/role-scope.enum'

export class Role extends AggregateRoot<RoleId> {
  private readonly _workspaceId?: WorkspaceId
  private _name: RoleName
  private _description?: string
  private _scope: RoleScope
  private readonly _isPredefined: boolean
  private _status: RoleStatus
  private readonly _createdBy?: UserId
  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt?: Date

  private constructor(props: RoleProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._name = props.name
    this._description = props.description
    this._scope = props.scope
    this._isPredefined = props.isPredefined
    this._status = props.status
    this._createdBy = props.createdBy
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(props: CreateRoleProps): Role {
    const now = new Date()

    return new Role({
      id: RoleId.create(),
      workspaceId: props.workspaceId,
      name: props.name,
      description: props.description,
      scope: props.scope,
      isPredefined: props.isPredefined,
      status: RoleStatus.ACTIVE,
      createdBy: props.createdBy,
      createdAt: now,
      updatedAt: now,
    })
  }

  get workspaceId(): WorkspaceId | undefined {
    return this._workspaceId
  }

  get name(): RoleName {
    return this._name
  }

  get description(): string | undefined {
    return this._description
  }

  get scope(): RoleScope {
    return this._scope
  }

  get isPredefined(): boolean {
    return this._isPredefined
  }

  get status(): RoleStatus {
    return this._status
  }

  get createdBy(): UserId | undefined {
    return this._createdBy
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt
  }

  static reconstitute(props: RoleProps): Role {
    return new Role(props)
  }

  rename(name: RoleName): void {
    this.ensureMutable()

    this._name = name

    this.touch()
  }

  activate(): void {
    this._status = RoleStatus.ACTIVE
    this.touch()
  }

  deactivate(): void {
    this.ensureMutable()

    this._status = RoleStatus.INACTIVE

    this.touch()
  }

  updateBasicData({
    name,
    description,
    status,
  }: {
    name?: RoleName
    description?: string
    status?: RoleStatus
  }) {
    this._name = name ?? this._name
    this._description = description ?? this._description
    this._status = status ?? this._status

    this.touch()
  }

  private ensureMutable(): void {
    if (this._isPredefined) {
      throw new Error()
    }
  }

  private touch(): void {
    this._updatedAt = new Date()
  }
}
