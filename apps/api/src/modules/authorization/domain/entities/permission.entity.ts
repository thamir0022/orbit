import { AggregateRoot } from '@/shared/domain'
import { PermissionId } from '../value-objects/permission-id.vo'
import { PermissionKey } from '../value-objects/permission-key.vo'
import { PermissionAction } from '../enums/permission-action.enum'
import { PermissionProps } from '../interfaces/permission.props'
import { CreatePermissionProps } from '../interfaces/create-permission.props'
import { PermissionResource } from '../enums/permission-resource.enum'
import { PermissionStatus } from '../enums/permission-status.enum'

export class Permission extends AggregateRoot<PermissionId> {
  private readonly _key: PermissionKey
  private _resource: PermissionResource
  private _action: PermissionAction
  private _description: string
  private _status: PermissionStatus
  private readonly _createdAt: Date
  private _updatedAt: Date

  private constructor(props: PermissionProps) {
    super(props.id)

    this._key = props.key
    this._resource = props.resource
    this._action = props.action
    this._description = props.description

    this._status = props.status

    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(props: CreatePermissionProps): Permission {
    const permissionId = PermissionId.create()
    const now = new Date()

    return new Permission({
      id: permissionId,
      key: props.key,
      resource: props.resource,
      action: props.action,
      description: props.description,
      status: PermissionStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: PermissionProps): Permission {
    return new Permission(props)
  }

  activate(): void {
    this._status = PermissionStatus.ACTIVE
    this.touch()
  }

  deactivate(): void {
    this._status = PermissionStatus.INACTIVE
    this.touch()
  }

  private touch(): void {
    this._updatedAt = new Date()
  }

  get permissionId(): PermissionId {
    return this._id
  }

  get key(): PermissionKey {
    return this._key
  }

  get status(): PermissionStatus {
    return this._status
  }

  get resource(): PermissionResource {
    return this._resource
  }

  get action(): PermissionAction {
    return this._action
  }

  get description(): string {
    return this._description
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  updateMetadata(params: {
    resource: PermissionResource
    action: PermissionAction
    description: string
  }): void {
    this._resource = params.resource
    this._action = params.action
    this._description = params.description

    this.touch()
  }
}
