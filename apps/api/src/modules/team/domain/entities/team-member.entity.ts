import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'
import { AggregateRoot } from '@/shared/domain'

import { TeamMemberStatus } from '../enums/team-member-status.enum'
import { TeamId } from '../value-objects/team-id.vo'
import {
  CreateTeamMemberProps,
  TeamMemberProps,
} from '../interfaces/team-member.interface'
import { TeamMemberId } from '../value-objects/team-member-id.vo'

export class TeamMember extends AggregateRoot<TeamMemberId> {
  private readonly _workspaceId: WorkspaceId
  private readonly _teamId: TeamId
  private readonly _userId: UserId

  private _status: TeamMemberStatus

  private readonly _addedBy: UserId
  private readonly _joinedAt: Date

  private _removedAt: Date | null
  private _removedBy: UserId | null

  private readonly _createdAt: Date
  private _updatedAt: Date

  constructor(props: TeamMemberProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._teamId = props.teamId
    this._userId = props.userId

    this._status = props.status

    this._addedBy = props.addedBy
    this._joinedAt = props.joinedAt

    this._removedBy = props.removedBy
    this._removedAt = props.removedAt
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(props: CreateTeamMemberProps): TeamMember {
    const id = TeamMemberId.create()
    const now = new Date()

    return new TeamMember({
      id,
      workspaceId: props.workspaceId,
      teamId: props.teamId,
      userId: props.userId,
      status: TeamMemberStatus.ACTIVE,
      addedBy: props.addedBy,
      joinedAt: now,
      removedBy: null,
      removedAt: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  activate(): void {
    if (this._status === TeamMemberStatus.ACTIVE) {
      return
    }

    this._status = TeamMemberStatus.ACTIVE
  }

  deactivate(): void {
    if (this._status === TeamMemberStatus.INACTIVE) {
      return
    }

    this._status = TeamMemberStatus.INACTIVE
  }

  isActive(): boolean {
    return this._status === TeamMemberStatus.ACTIVE
  }

  isInactive(): boolean {
    return this._status === TeamMemberStatus.INACTIVE
  }

  remove(userId: UserId): void {
    if (this._status === TeamMemberStatus.INACTIVE) return

    this._status = TeamMemberStatus.INACTIVE
    this._removedAt = new Date()
    this._removedBy = userId
  }

  restore(): void {
    if (this._status === TeamMemberStatus.ACTIVE) return

    this._status = TeamMemberStatus.ACTIVE
    this._removedAt = null
    this._removedBy = null
  }

  get id(): TeamMemberId {
    return this._id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get teamId(): TeamId {
    return this._teamId
  }

  get userId(): UserId {
    return this._userId
  }

  get status(): TeamMemberStatus {
    return this._status
  }

  get addedBy(): UserId {
    return this._addedBy
  }

  get joinedAt(): Date {
    return this._joinedAt
  }

  get removedBy(): UserId | null {
    return this._removedBy
  }

  get removedAt(): Date | null {
    return this._removedAt
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  static reconstitute(props: TeamMemberProps): TeamMember {
    return new TeamMember(props)
  }
}
