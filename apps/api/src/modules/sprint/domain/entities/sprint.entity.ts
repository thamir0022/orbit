import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { AggregateRoot } from '@/shared/domain'
import { SprintStatus } from '../enums/sprint-status.enum'
import {
  InvalidSprintDateRangeException,
  InvalidSprintPointsException,
  SprintCancellationFailedException,
  SprintCompletionFailedException,
  SprintNotEditableException,
  SprintStartFailedException,
} from '../exceptions'
import {
  CreateSprintProps,
  SprintProps,
  UpdateSprintProps,
} from '../interfaces/sprint.interface'
import { SprintId } from '../value-objects/sprint-id.vo'

/**
 * Aggregate root representing a timeboxed sprint owned by a team.
 *
 * The aggregate is responsible for enforcing sprint lifecycle,
 * timebox, and planning invariants.
 */
export class Sprint extends AggregateRoot<SprintId> {
  private readonly _workspaceId: WorkspaceId
  private readonly _teamId: TeamId

  private _name: string
  private _goal?: string
  private _description?: string

  private _startDate: Date
  private _endDate: Date

  private _status: SprintStatus

  private _committedPoints: number | null
  private _completedPoints: number | null

  private readonly _createdBy: UserId

  private _startedAt: Date | null
  private _completedAt: Date | null
  private _cancelledAt: Date | null
  private _cancelledBy: UserId | null

  private constructor(props: SprintProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._teamId = props.teamId

    this._name = props.name
    this._goal = props.goal
    this._description = props.description

    this._startDate = this.cloneDate(props.startDate)
    this._endDate = this.cloneDate(props.endDate)

    this._status = props.status

    this._committedPoints = props.committedPoints ?? null
    this._completedPoints = props.completedPoints ?? null

    this._createdBy = props.createdBy

    this._startedAt = this.cloneNullableDate(props.startedAt)
    this._completedAt = this.cloneNullableDate(props.completedAt)
    this._cancelledAt = this.cloneNullableDate(props.cancelledAt)
    this._cancelledBy = props.cancelledBy ?? null

    this.validateDateRange()
    this.validateState()
  }

  /**
   * Creates a new sprint in the planned state.
   */
  static create(props: CreateSprintProps): Sprint {
    const now = new Date()

    return new Sprint({
      id: SprintId.create(),

      workspaceId: WorkspaceId.create(props.workspaceId),
      teamId: TeamId.create(props.teamId),

      name: props.name,
      goal: props.goal,
      description: props.description,

      startDate: new Date(props.startDate),
      endDate: new Date(props.endDate),

      status: SprintStatus.PLANNED,

      committedPoints: null,
      completedPoints: null,

      createdBy: UserId.create(props.createdBy),

      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelledBy: null,

      // Timestamps are managed by the persistence layer.
      createdAt: now,
      updatedAt: now,
    })
  }

  /**
   * Updates sprint details while the sprint is still planned.
   */
  updateSprint(props: UpdateSprintProps): void {
    this.ensurePlanned()

    const nextStartDate = props.startDate
      ? new Date(props.startDate)
      : this._startDate

    const nextEndDate = props.endDate ? new Date(props.endDate) : this._endDate

    this.validateDateRange(nextStartDate, nextEndDate)

    if (props.name !== undefined) {
      this._name = props.name
    }

    if (props.goal !== undefined) {
      this._goal = props.goal
    }

    if (props.description !== undefined) {
      this._description = props.description
    }

    this._startDate = this.cloneDate(nextStartDate)
    this._endDate = this.cloneDate(nextEndDate)
  }

  /**
   * Sets the committed story-point snapshot during planning.
   */
  commitPoints(points: number): void {
    this.ensurePlanned()
    this.validatePoints(points)

    this._committedPoints = points
  }

  /**
   * Records the completed story-point snapshot.
   */
  recordCompletedPoints(points: number): void {
    if (!this.isActive && !this.isCompleted) {
      throw new SprintCompletionFailedException()
    }

    this.validatePoints(points)

    this._completedPoints = points
  }

  /**
   * Starts the sprint.
   */
  start(): void {
    if (!this.isPlanned) {
      throw new SprintStartFailedException()
    }

    this._status = SprintStatus.ACTIVE
    this._startedAt = new Date()
  }

  /**
   * Completes the sprint.
   */
  complete(): void {
    if (!this.isActive) {
      throw new SprintCompletionFailedException()
    }

    this._status = SprintStatus.COMPLETED
    this._completedAt = new Date()
  }

  /**
   * Cancels the sprint.
   */
  cancel(userId: UserId): void {
    if (!this.isPlanned && !this.isActive) {
      throw new SprintCancellationFailedException()
    }

    this._status = SprintStatus.CANCELLED
    this._cancelledAt = new Date()
    this._cancelledBy = userId
  }

  /**
   * Validates the aggregate's persisted state.
   */
  private validateState(): void {
    if (this._status === SprintStatus.ACTIVE && this._startedAt === null) {
      throw new SprintStartFailedException()
    }

    if (this._status === SprintStatus.COMPLETED && this._completedAt === null) {
      throw new SprintCompletionFailedException()
    }

    if (
      this._status === SprintStatus.CANCELLED &&
      (this._cancelledAt === null || this._cancelledBy === null)
    ) {
      throw new SprintCancellationFailedException()
    }

    if (this._committedPoints !== null) {
      this.validatePoints(this._committedPoints)
    }

    if (this._completedPoints !== null) {
      this.validatePoints(this._completedPoints)
    }
  }

  /**
   * Ensures the sprint timebox is valid.
   */
  private validateDateRange(
    startDate = this._startDate,
    endDate = this._endDate
  ): void {
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      throw new InvalidSprintDateRangeException()
    }
  }

  /**
   * Ensures only planned sprints can be edited.
   */
  private ensurePlanned(): void {
    if (!this.isPlanned) {
      throw new SprintNotEditableException()
    }
  }

  /**
   * Ensures points are valid whole numbers.
   */
  private validatePoints(points: number): void {
    if (!Number.isInteger(points) || points < 0) {
      throw new InvalidSprintPointsException()
    }
  }

  /**
   * Prevents external mutation of Date instances.
   */
  private cloneDate(date: Date): Date {
    return new Date(date.getTime())
  }

  private cloneNullableDate(date?: Date | null): Date | null {
    return date ? this.cloneDate(date) : null
  }

  get id(): SprintId {
    return this._id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get teamId(): TeamId {
    return this._teamId
  }

  get name(): string {
    return this._name
  }

  get goal(): string | undefined {
    return this._goal
  }

  get description(): string | undefined {
    return this._description
  }

  get startDate(): Date {
    return this.cloneDate(this._startDate)
  }

  get endDate(): Date {
    return this.cloneDate(this._endDate)
  }

  get status(): SprintStatus {
    return this._status
  }

  get committedPoints(): number | null {
    return this._committedPoints
  }

  get completedPoints(): number | null {
    return this._completedPoints
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  get startedAt(): Date | null {
    return this.cloneNullableDate(this._startedAt)
  }

  get completedAt(): Date | null {
    return this.cloneNullableDate(this._completedAt)
  }

  get cancelledAt(): Date | null {
    return this.cloneNullableDate(this._cancelledAt)
  }

  get cancelledBy(): UserId | null {
    return this._cancelledBy
  }

  get isPlanned(): boolean {
    return this._status === SprintStatus.PLANNED
  }

  get isActive(): boolean {
    return this._status === SprintStatus.ACTIVE
  }

  get isCompleted(): boolean {
    return this._status === SprintStatus.COMPLETED
  }

  get isCancelled(): boolean {
    return this._status === SprintStatus.CANCELLED
  }

  /**
   * Rehydrates a sprint from persistence.
   */
  static reconstitute(props: SprintProps): Sprint {
    return new Sprint(props)
  }
}
