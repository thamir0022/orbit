import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { AggregateRoot } from '@/shared/domain'
import { SprintStatus } from '../enums/sprint-status.enum'
import {
  InvalidSprintDateRangeException,
  InvalidSprintLifeCycleState,
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

const SPRINT_NAME_MAX_LENGTH = 120
const SPRINT_GOAL_MAX_LENGTH = 500
const SPRINT_DESCRIPTION_MAX_LENGTH = 5000

/**
 * Aggregate root representing a time-boxed Sprint owned by a Team.
 *
 * Responsibilities:
 * - Enforce Sprint lifecycle and scheduling invariants.
 * - Protect internal mutable state.
 * - Keep lifecycle timestamps consistent with status.
 *
 * Persistence infrastructure manages createdAt and updatedAt.
 * Reconstitute the aggregate from the persisted document after saving
 * when the latest audit timestamps are required.
 */
export class Sprint extends AggregateRoot<SprintId> {
  private readonly _workspaceId: WorkspaceId
  private readonly _teamId: TeamId

  private _name: string
  private _goal: string | null
  private _description: string | null

  private _startDate: Date
  private _endDate: Date

  private _status: SprintStatus

  private readonly _createdBy: UserId
  private readonly _createdAt: Date
  private _updatedAt: Date

  private _startedAt: Date | null
  private _completedAt: Date | null
  private _cancelledAt: Date | null
  private _cancelledBy: UserId | null

  private constructor(props: SprintProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._teamId = props.teamId

    this._name = this.normalizeName(props.name)
    this._goal = this.normalizeOptionalText(
      props.goal,
      SPRINT_GOAL_MAX_LENGTH,
      'Sprint goal'
    )
    this._description = this.normalizeOptionalText(
      props.description,
      SPRINT_DESCRIPTION_MAX_LENGTH,
      'Sprint description'
    )

    this._startDate = this.cloneDate(props.startDate)
    this._endDate = this.cloneDate(props.endDate)

    this._status = props.status

    this._createdBy = props.createdBy
    this._createdAt = this.cloneDate(props.createdAt)
    this._updatedAt = this.cloneDate(props.updatedAt)

    this._startedAt = this.cloneNullableDate(props.startedAt)
    this._completedAt = this.cloneNullableDate(props.completedAt)
    this._cancelledAt = this.cloneNullableDate(props.cancelledAt)
    this._cancelledBy = props.cancelledBy ?? null

    this.validateDateRange()
    this.validateLifecycleState()
  }

  /**
   * Creates a new Sprint in the planned state.
   */
  static create(props: CreateSprintProps): Sprint {
    const now = new Date()

    return new Sprint({
      id: SprintId.create(),

      workspaceId: WorkspaceId.create(props.workspaceId),
      teamId: TeamId.create(props.teamId),

      name: props.name,
      goal: props.goal ?? null,
      description: props.description ?? null,

      startDate: new Date(props.startDate),
      endDate: new Date(props.endDate),

      status: SprintStatus.PLANNED,

      createdBy: UserId.create(props.createdBy),

      createdAt: now,
      updatedAt: now,

      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelledBy: null,
    })
  }

  /**
   * Updates Sprint details while the Sprint is planned.
   *
   * Undefined properties are ignored. Nullable text properties can
   * explicitly be cleared by passing null or an empty string.
   */
  update(props: UpdateSprintProps): void {
    this.ensurePlanned()

    const nextStartDate =
      props.startDate !== undefined
        ? new Date(props.startDate)
        : this._startDate

    const nextEndDate =
      props.endDate !== undefined ? new Date(props.endDate) : this._endDate

    this.validateDateRange(nextStartDate, nextEndDate)

    const nextName =
      props.name !== undefined ? this.normalizeName(props.name) : this._name

    const nextGoal =
      props.goal !== undefined
        ? this.normalizeOptionalText(
            props.goal,
            SPRINT_GOAL_MAX_LENGTH,
            'Sprint goal'
          )
        : this._goal

    const nextDescription =
      props.description !== undefined
        ? this.normalizeOptionalText(
            props.description,
            SPRINT_DESCRIPTION_MAX_LENGTH,
            'Sprint description'
          )
        : this._description

    this._name = nextName
    this._goal = nextGoal
    this._description = nextDescription
    this._startDate = this.cloneDate(nextStartDate)
    this._endDate = this.cloneDate(nextEndDate)
  }

  /**
   * Starts the Sprint.
   *
   * The application layer may supply the current time for deterministic
   * testing. The default preserves compatibility with start().
   */
  start(at: Date = new Date()): void {
    if (!this.isPlanned) {
      throw new SprintStartFailedException()
    }

    if (!this._goal) {
      throw new SprintStartFailedException(
        'Sprint goal is required to start the sprint'
      )
    }

    this.assertValidTimestamp(at, 'Sprint start timestamp')

    this._status = SprintStatus.ACTIVE
    this._startedAt = this.cloneDate(at)
  }

  /**
   * Completes an active Sprint.
   */
  complete(at: Date = new Date()): void {
    if (!this.isActive || !this._startedAt) {
      throw new SprintCompletionFailedException()
    }

    this.assertValidTimestamp(at, 'Sprint completion timestamp')

    if (at < this._startedAt) {
      throw new SprintCompletionFailedException(
        "Sprint completed date can't be before start date"
      )
    }

    this._status = SprintStatus.COMPLETED
    this._completedAt = this.cloneDate(at)
  }

  /**
   * Cancels a planned or active Sprint.
   */
  cancel(userId: UserId, at: Date = new Date()): void {
    if (!this.isPlanned && !this.isActive) {
      throw new SprintCancellationFailedException()
    }

    this.assertValidTimestamp(at, 'Sprint cancellation timestamp')

    if (this._startedAt && at < this._startedAt) {
      throw new SprintCancellationFailedException(
        "Sprint cancelled date can't be before start date"
      )
    }

    this._status = SprintStatus.CANCELLED
    this._cancelledAt = this.cloneDate(at)
    this._cancelledBy = userId
  }

  /**
   * Ensures the Sprint timebox is valid.
   */
  private validateDateRange(
    startDate: Date = this._startDate,
    endDate: Date = this._endDate
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
   * Ensures the stored lifecycle timestamps match the Sprint status.
   *
   * This also protects aggregate reconstitution from inconsistent data.
   */
  private validateLifecycleState(): void {
    const hasStartedAt = this._startedAt !== null
    const hasCompletedAt = this._completedAt !== null
    const hasCancelledAt = this._cancelledAt !== null
    const hasCancelledBy = this._cancelledBy !== null

    const isValid = (() => {
      switch (this._status) {
        case SprintStatus.PLANNED:
          return (
            !hasStartedAt &&
            !hasCompletedAt &&
            !hasCancelledAt &&
            !hasCancelledBy
          )

        case SprintStatus.ACTIVE:
          return (
            hasStartedAt &&
            !hasCompletedAt &&
            !hasCancelledAt &&
            !hasCancelledBy
          )

        case SprintStatus.COMPLETED:
          return (
            hasStartedAt &&
            hasCompletedAt &&
            !hasCancelledAt &&
            !hasCancelledBy &&
            this._completedAt! >= this._startedAt!
          )

        case SprintStatus.CANCELLED:
          return (
            hasCancelledAt &&
            hasCancelledBy &&
            !hasCompletedAt &&
            (!hasStartedAt || this._cancelledAt! >= this._startedAt!)
          )

        default:
          return false
      }
    })()

    if (!isValid) throw new InvalidSprintLifeCycleState(this._id)

    this.validateLifecycleTimestamp(this._startedAt, 'Sprint start timestamp')
    this.validateLifecycleTimestamp(
      this._completedAt,
      'Sprint completion timestamp'
    )
    this.validateLifecycleTimestamp(
      this._cancelledAt,
      'Sprint cancellation timestamp'
    )
  }

  /**
   * Ensures only planned Sprints can be edited.
   */
  private ensurePlanned(): void {
    if (!this.isPlanned) {
      throw new SprintNotEditableException()
    }
  }

  private normalizeName(name: string): string {
    const normalized = name.trim()

    if (!normalized) {
      throw new TypeError('Sprint name cannot be empty.')
    }

    if (normalized.length > SPRINT_NAME_MAX_LENGTH) {
      throw new RangeError(
        `Sprint name cannot exceed ${SPRINT_NAME_MAX_LENGTH} characters.`
      )
    }

    return normalized
  }

  private normalizeOptionalText(
    value: string | null | undefined,
    maxLength: number,
    fieldName: string
  ): string | null {
    const normalized = value?.trim()

    if (!normalized) {
      return null
    }

    if (normalized.length > maxLength) {
      throw new RangeError(
        `${fieldName} cannot exceed ${maxLength} characters.`
      )
    }

    return normalized
  }

  private assertValidTimestamp(value: Date, fieldName: string): void {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new TypeError(`${fieldName} must be a valid date.`)
    }
  }

  private validateLifecycleTimestamp(
    value: Date | null,
    fieldName: string
  ): void {
    if (value !== null) {
      this.assertValidTimestamp(value, fieldName)
    }
  }

  /**
   * Prevents external mutation of Date instances.
   */
  private cloneDate(date: Date): Date {
    return new Date(date.getTime())
  }

  private cloneNullableDate(date?: Date | null): Date | null {
    return date == null ? null : this.cloneDate(date)
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

  get goal(): string | null {
    return this._goal
  }

  get description(): string | null {
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

  get createdAt(): Date {
    return this.cloneDate(this._createdAt)
  }

  get updatedAt(): Date {
    return this.cloneDate(this._updatedAt)
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
   * Reconstitutes a Sprint from persistence.
   */
  static reconstitute(props: SprintProps): Sprint {
    return new Sprint(props)
  }
}
