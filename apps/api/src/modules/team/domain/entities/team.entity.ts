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
  private _avatar?: string
  private _leadId?: UserId
  private _status: TeamStatus
  private readonly _createdBy: UserId
  private readonly _createdAt: Date
  private _updatedAt: Date

  constructor(props: TeamProps) {
    super(props.id)
    this._workspaceId = props.workspaceId
    this._name = props.name
    this._description = props.description
    this._avatar = props.avatar
    this._leadId = props.leadId
    this._status = props.status
    this._createdBy = props.createdBy
    this._createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
  }

  static create(props: CreateTeamProps) {
    const teamId = TeamId.create()
    const now = new Date()

    const team = new Team({
      id: teamId,
      workspaceId: props.workspaceId,
      name: props.name,
      description: props.description,
      avatar: props.avatar,
      leadId: props.leadId,
      status: TeamStatus.ACTIVE,
      createdBy: props.createdBy,
      createdAt: now,
      updatedAt: now,
    })

    return team
  }

  updateTeam(props: UpdateTeamProps) {
    this._name = props.name ?? this._name
    this._description = props.description ?? this._description
    this._avatar = props.avatar ?? this._avatar
    this._leadId = props.leadId ?? this._leadId
    this._status = props.status ?? this._status
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

  get avatar(): string | undefined {
    return this._avatar
  }

  get leadId(): UserId | undefined {
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

  static reconstitute(props: TeamProps): Team {
    return new Team(props)
  }
}
