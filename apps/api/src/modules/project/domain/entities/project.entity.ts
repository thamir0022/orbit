import { AggregateRoot } from '@/shared/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { ProjectId } from '../value-objects/project-id.vo'
import { ProjectKey } from '../value-objects/project-key.vo'
import { ProjectType } from '../enums/project-type.enum'
import { ProjectStage } from '../enums/project-stage.enum'
import { ProjectPriority } from '../enums/project-priority.enum'
import { ProjectStatus } from '../enums/project-status.enum'
import { ProjectProps } from '../interfaces/project.props'
import { UpdateProjectProps } from '../interfaces/update-project.props'
import { CreateProjectProps } from '../interfaces/create-project.props'
import {
  InvalidProjectDateRangeException,
  ProjectAlreadyDeletedException,
} from '../exceptions'

export class Project extends AggregateRoot<ProjectId> {
  private _workspaceId: WorkspaceId

  private _name: string
  private _key: ProjectKey

  // Project metadata
  private _description?: string
  private _avatarUrl?: string

  // Project classification
  private _type: ProjectType
  private _stage: ProjectStage
  private _priority: ProjectPriority

  // Project ownership
  private _leadId?: UserId

  // Project lifecycle
  private _status: ProjectStatus
  private _startDate?: Date
  private _targetEndDate?: Date

  // Audit
  private readonly _createdAt: Date
  private readonly _createdBy: UserId

  private _updatedAt: Date

  // Soft deletion
  private _deletedAt: Date | null
  private _deletedBy: UserId | null

  private constructor(props: ProjectProps) {
    super(props.id)

    this._workspaceId = props.workspaceId

    this._name = props.name
    this._key = props.key

    this._description = props.description
    this._avatarUrl = props.avatarUrl

    this._type = props.type
    this._stage = props.stage
    this._priority = props.priority

    this._leadId = props.leadId

    this._status = props.status
    this._startDate = props.startDate
    this._targetEndDate = props.targetEndDate

    this._createdAt = props.createdAt
    this._createdBy = props.createdBy

    this._updatedAt = props.updatedAt

    this._deletedAt = props.deletedAt
    this._deletedBy = props.deletedBy
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  get projectId(): ProjectId {
    return this.id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get name(): string {
    return this._name
  }

  get key(): ProjectKey {
    return this._key
  }

  get description(): string | undefined {
    return this._description
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl
  }

  get type(): ProjectType {
    return this._type
  }

  get stage(): ProjectStage {
    return this._stage
  }

  get priority(): ProjectPriority {
    return this._priority
  }

  get leadId(): UserId | undefined {
    return this._leadId
  }

  get status(): ProjectStatus {
    return this._status
  }

  get startDate(): Date | undefined {
    return this._startDate ? new Date(this._startDate.getTime()) : undefined
  }

  get targetEndDate(): Date | undefined {
    return this._targetEndDate
      ? new Date(this._targetEndDate.getTime())
      : undefined
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime())
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime())
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt ? new Date(this._deletedAt.getTime()) : undefined
  }

  get deletedBy(): UserId | null {
    return this._deletedBy
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null
  }

  // ---------------------------------------------------------------------------
  // Domain behavior
  // ---------------------------------------------------------------------------

  /**
   * Updates mutable project properties.
   *
   * `null` explicitly clears nullable values such as leadId and dates.
   */
  update(props: UpdateProjectProps): void {
    this.ensureNotDeleted()

    if (props.name !== undefined) {
      this._name = props.name
    }

    if (props.description !== undefined) {
      this._description = props.description
    }

    if (props.avatarUrl !== undefined) {
      this._avatarUrl = props.avatarUrl
    }

    if (props.type !== undefined) {
      this._type = props.type
    }

    if (props.stage !== undefined) {
      this._stage = props.stage
    }

    if (props.priority !== undefined) {
      this._priority = props.priority
    }

    if (props.status !== undefined) {
      this._status = props.status
    }

    if (props.leadId !== undefined) {
      this._leadId = props.leadId ?? undefined
    }

    if (props.startDate !== undefined) {
      this._startDate = props.startDate ?? undefined
    }

    if (props.targetEndDate !== undefined) {
      this._targetEndDate = props.targetEndDate ?? undefined
    }

    this.validateDateRange()

    this.touch()
  }

  /**
   * Soft deletes the project.
   */
  delete(deletedBy: UserId): void {
    this.ensureNotDeleted()

    this._deletedAt = new Date()
    this._deletedBy = deletedBy

    this.touch()
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private ensureNotDeleted(): void {
    if (this._deletedAt) {
      throw new ProjectAlreadyDeletedException()
    }
  }

  private validateDateRange(): void {
    if (
      this._startDate &&
      this._targetEndDate &&
      this._targetEndDate.getTime() < this._startDate.getTime()
    ) {
      throw new InvalidProjectDateRangeException()
    }
  }

  private touch(): void {
    this._updatedAt = new Date()
  }

  // ---------------------------------------------------------------------------
  // Factory methods
  // ---------------------------------------------------------------------------

  static create(props: CreateProjectProps): Project {
    const now = new Date()

    const project = new Project({
      id: ProjectId.create(),

      workspaceId: props.workspaceId,

      name: props.name,
      key: props.key,

      description: props.description,
      avatarUrl: props.avatarUrl,

      type: props.type ?? ProjectType.PRODUCT,
      stage: props.stage ?? ProjectStage.PROPOSAL,
      priority: props.priority ?? ProjectPriority.NO_PRIORITY,

      leadId: props.leadId,

      status: ProjectStatus.ACTIVE,

      startDate: props.startDate,
      targetEndDate: props.targetEndDate,

      createdBy: props.createdBy,
      createdAt: now,
      updatedAt: now,

      deletedAt: null,
      deletedBy: null,
    })

    project.validateDateRange()

    return project
  }

  static reconstitute(props: ProjectProps): Project {
    return new Project(props)
  }
}
