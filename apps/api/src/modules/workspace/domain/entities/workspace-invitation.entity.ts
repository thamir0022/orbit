import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'
import { Email, UserId } from '@/modules/user/domain'
import { BaseEntity } from '@/shared/domain'
import { WorkspaceInvitationStatus } from '../enums'
import {
  CreateWorkspaceInvitaionProps,
  WorkspaceInvitationProps,
} from '../interfaces'
import { WorkspaceId, WorkspaceInvitationId } from '../value-objects'
import {
  WorkspaceInvitationAlreadyAcceptedException,
  WorkspaceInvitationDeclinedException,
  WorkspaceInvitationEmailMismatchException,
  WorkspaceInvitationExpiredException,
  WorkspaceInvitationRevokedException,
} from '../exceptions/workspace.exception'

export class WorkspaceInvitation extends BaseEntity<WorkspaceInvitationId> {
  private readonly _workspaceId: WorkspaceId
  private readonly _email: Email
  private readonly _roleId: RoleId
  private readonly _invitedBy: UserId
  private _status: WorkspaceInvitationStatus
  private readonly _tokenHash: string
  private readonly _expiresAt: Date
  private _acceptedAt: Date | null
  private readonly _createdAt: Date
  private _updatedAt: Date

  private constructor(props: WorkspaceInvitationProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._email = props.email
    this._roleId = props.roleId
    this._invitedBy = props.invitedBy
    this._status = props.status
    this._tokenHash = props.tokenHash
    this._expiresAt = props.expiresAt
    this._acceptedAt = props.acceptedAt ?? null
    this._createdAt = props.createdAt ?? new Date()
    this._updatedAt = props.updatedAt ?? new Date()
  }

  static create(props: CreateWorkspaceInvitaionProps): WorkspaceInvitation {
    const now = new Date()

    return new WorkspaceInvitation({
      id: WorkspaceInvitationId.create(),
      workspaceId: props.workspaceId,
      email: props.email,
      roleId: props.roleId,
      invitedBy: props.invitedBy,
      status: WorkspaceInvitationStatus.PENDING,
      tokenHash: props.tokenHash,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: WorkspaceInvitationProps): WorkspaceInvitation {
    return new WorkspaceInvitation(props)
  }

  public accept(email: Email): void {
    if (!this._email.equals(email))
      throw new WorkspaceInvitationEmailMismatchException()
    if (this.isExpired()) throw new WorkspaceInvitationExpiredException()
    if (this.status === WorkspaceInvitationStatus.ACCEPTED)
      throw new WorkspaceInvitationAlreadyAcceptedException()
    if (this.status === WorkspaceInvitationStatus.DECLINED)
      throw new WorkspaceInvitationDeclinedException()
    if (this.status === WorkspaceInvitationStatus.REVOKED)
      throw new WorkspaceInvitationRevokedException()

    this._status = WorkspaceInvitationStatus.ACCEPTED
    this._acceptedAt = new Date()
    this.touch()
  }

  public reject(): void {
    if (this.status !== WorkspaceInvitationStatus.PENDING)
      throw new Error('Only pending invitations can be declined.')

    this._status = WorkspaceInvitationStatus.DECLINED
    this.touch()
  }

  public revoke(): void {
    if (this.status !== WorkspaceInvitationStatus.PENDING)
      throw new Error('Only pending invitations can be revoked.')

    this._status = WorkspaceInvitationStatus.REVOKED
    this.touch()
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  isAccepted(): boolean {
    return this.acceptedAt != null && new Date() > this.acceptedAt
  }

  private touch(): void {
    this._updatedAt = new Date()
  }

  get id() {
    return this._id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get email(): Email {
    return this._email
  }

  get roleId(): RoleId {
    return this._roleId
  }

  get invitedBy(): UserId {
    return this._invitedBy
  }

  get status(): WorkspaceInvitationStatus {
    return this._status
  }

  get tokenHash(): string {
    return this._tokenHash
  }

  get acceptedAt(): Date | null {
    return this._acceptedAt
  }

  get expiresAt(): Date {
    return this._expiresAt
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }
}
