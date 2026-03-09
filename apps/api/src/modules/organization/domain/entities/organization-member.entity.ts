import { UuidUtil } from '@/shared/utils'
import { OrganizationMemberStatus } from '../enums/organization-member-status.enum'
import { UserId } from '@/modules/user/domain'
import { OrganizationId } from '../value-objects'

export interface OrganizationMemberProps {
  id?: string
  organizationId: OrganizationId
  userId: UserId
  roleId: string
  status?: OrganizationMemberStatus
  invitedBy?: string | null
  invitedAt?: Date | null
  joinedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export class OrganizationMember {
  private readonly _id: string
  private _organizationId: OrganizationId
  private _userId: UserId
  private _roleId: string
  private _status: OrganizationMemberStatus
  private _invitedBy: string | null
  private _invitedAt: Date | null
  private _joinedAt: Date | null
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(props: OrganizationMemberProps) {
    this._id = props.id || UuidUtil.generate() // Assuming UuidUtil generates UUIDv7
    this._organizationId = props.organizationId
    this._userId = props.userId
    this._roleId = props.roleId
    this._status = props.status || OrganizationMemberStatus.ACTIVE
    this._invitedBy = props.invitedBy || null
    this._invitedAt = props.invitedAt || null
    this._joinedAt =
      props.joinedAt ||
      (this._status === OrganizationMemberStatus.ACTIVE ? new Date() : null)
    this._createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
  }

  // Factory method for creating a new member (e.g., the owner during sign-up)
  public static create(
    props: Omit<OrganizationMemberProps, 'id' | 'createdAt' | 'updatedAt'>
  ): OrganizationMember {
    return new OrganizationMember(props)
  }

  // Factory method for reconstituting an existing member from the database
  public static reconstitute(
    props: OrganizationMemberProps
  ): OrganizationMember {
    return new OrganizationMember(props)
  }

  // Domain Behaviors
  public suspend(): void {
    this._status = OrganizationMemberStatus.SUSPENDED
    this.touch()
  }

  public activate(): void {
    this._status = OrganizationMemberStatus.ACTIVE
    this.touch()
  }

  public changeRole(newRoleId: string): void {
    this._roleId = newRoleId
    this.touch()
  }

  private touch() {
    this._updatedAt = new Date()
  }

  // Getters
  get id(): string {
    return this._id
  }

  get organizationId(): OrganizationId {
    return this._organizationId
  }

  get userId(): UserId {
    return this._userId
  }

  get roleId(): string {
    return this._roleId
  }

  get status(): OrganizationMemberStatus {
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
