import { WorkspaceId } from '@/modules/workspace/domain'
import { AggregateRoot } from '@/shared/domain'
import { TeamId } from '../value-objects/team-id.vo'
import { TeamStatus } from '../enums/team-status.enum'
import { UserId } from '@/modules/user/domain'
import {
  CreateTeamProps,
  TeamProps,
  UpdateTeamProps,
} from '../interfaces/team.interface'

export class Team extends AggregateRoot<TeamId> {
  private readonly _workspaceId: WorkspaceId
  private _name: string
  private _description?: string
  private _avatarUrl?: string
  private _leadId: UserId | null
  private _status: TeamStatus
  private _deletedAt: Date | null
  private _deletedBy: UserId | null
  private readonly _createdBy: UserId
  private readonly _createdAt: Date
  private _updatedAt: Date

  constructor(props: TeamProps) {
    super(props.id)
    this._workspaceId = props.workspaceId
    this._name = props.name
    this._description = props.description
    this._avatarUrl = props.avatarUrl
    this._leadId = props.leadId
    this._status = props.status
    this._createdBy = props.createdBy
    this._deletedAt = props.deletedAt
    this._deletedBy = props.deletedBy
    this._createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
  }

  static create(props: CreateTeamProps) {
    const teamId = TeamId.create()
    const now = new Date()

    const team = new Team({
      id: teamId,
      workspaceId: WorkspaceId.create(props.workspaceId),
      name: props.name,
      description: props.description,
      avatarUrl: props.avatarUrl,
      leadId: props.leadId ? UserId.create(props.leadId) : null,
      status: TeamStatus.ACTIVE,
      createdBy: UserId.create(props.createdBy),
      deletedAt: null,
      deletedBy: null,
      createdAt: now,
      updatedAt: now,
    })

    return team
  }

  updateTeam(props: UpdateTeamProps) {
    this._name = props.name ?? this._name
    this._description = props.description ?? this._description
    this._avatarUrl = props.avatarUrl ?? this._avatarUrl
    this._leadId = props.leadId ? UserId.create(props.leadId) : this._leadId
    this._status = props.status ?? this._status
  }

  delete(userId: UserId): void {
    this._deletedAt = new Date()
    this._deletedBy = userId
  }

  restore(): void {
    this._deletedAt = null
    this._deletedBy = null
  }

  isDeleted(): boolean {
    return this._deletedAt !== null
  }

  get id(): TeamId {
    return this._id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get name(): string {
    return this._name
  }

  get description(): string | undefined {
    return this._description
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl
  }

  get leadId(): UserId | null {
    return this._leadId
  }

  get status(): TeamStatus {
    return this._status
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  get deletedBy(): UserId | null {
    return this._deletedBy
  }

  get isActive(): boolean {
    return this._status === TeamStatus.ACTIVE
  }

  get isArchived(): boolean {
    return this._status === TeamStatus.ARCHIVED
  }

  static reconstitute(props: TeamProps): Team {
    return new Team(props)
  }
}
