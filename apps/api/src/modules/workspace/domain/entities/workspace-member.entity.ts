import { UuidUtil } from '@/shared/utils'
import { WorkspaceMemberStatus } from '../enums/workspace-member-status.enum'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '../value-objects'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

export interface WorkspaceMemberProps {
  id?: string
  workspaceId: WorkspaceId
  userId: UserId
  roleId: RoleId
  status?: WorkspaceMemberStatus
  invitedBy?: string | null
  invitedAt?: Date | null
  joinedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export class WorkspaceMember {
  private readonly _id: string
  private _workspaceId: WorkspaceId
  private _userId: UserId
  private _roleId: RoleId
  private _status: WorkspaceMemberStatus
  private _invitedBy: string | null
  private _invitedAt: Date | null
  private _joinedAt: Date | null
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(props: WorkspaceMemberProps) {
    this._id = props.id || UuidUtil.generate() // Assuming UuidUtil generates UUIDv7
    this._workspaceId = props.workspaceId
    this._userId = props.userId
    this._roleId = props.roleId
    this._status = props.status || WorkspaceMemberStatus.ACTIVE
    this._invitedBy = props.invitedBy || null
    this._invitedAt = props.invitedAt || null
    this._joinedAt =
      props.joinedAt ||
      (this._status === WorkspaceMemberStatus.ACTIVE ? new Date() : null)
    this._createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
  }

  // Factory method for creating a new member (e.g., the owner during sign-up)
  public static create(
    props: Omit<WorkspaceMemberProps, 'createdAt' | 'updatedAt'>
  ): WorkspaceMember {
    const data: Omit<WorkspaceMemberProps, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: props.userId,
      workspaceId: props.workspaceId,
      roleId: props.roleId,
      joinedAt: props.joinedAt ?? new Date(),
      status: WorkspaceMemberStatus.ACTIVE,
      invitedBy: props.invitedBy,
      invitedAt: props.invitedAt,
    }
    return new WorkspaceMember(data)
  }

  // Factory method for reconstituting an existing member from the database
  public static reconstitute(props: WorkspaceMemberProps): WorkspaceMember {
    return new WorkspaceMember(props)
  }

  // Domain Behaviors
  public suspend(): void {
    this._status = WorkspaceMemberStatus.SUSPENDED
    this.touch()
  }

  public activate(): void {
    this._status = WorkspaceMemberStatus.ACTIVE
    this.touch()
  }

  public changeRole(newRoleId: string): void {
    this._roleId = RoleId.create(newRoleId)
    this.touch()
  }

  public changeStatus(status: WorkspaceMemberStatus): void {
    this._status = status
    this.touch()
  }

  private touch() {
    this._updatedAt = new Date()
  }

  // Getters
  get id(): string {
    return this._id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get userId(): UserId {
    return this._userId
  }

  get roleId(): RoleId {
    return this._roleId
  }

  get status(): WorkspaceMemberStatus {
    return this._status
  }

  get invitedBy(): string | null {
    return this._invitedBy
  }

  get invitedAt(): Date | null {
    return this._invitedAt
  }

  get joinedAt(): Date | null {
    return this._joinedAt
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }
}
