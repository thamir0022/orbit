import { ProjectId } from '@/modules/project/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { AggregateRoot } from '@/shared/domain'

import {
  WorkItemAlreadyDeletedException,
  WorkItemCompletedBeforeStartedException,
  WorkItemDeletedException,
  WorkItemInvalidStatusTransitionException,
  WorkItemNotDeletedException,
  WorkItemSelfParentException,
  WorkItemTitleNotAllowedException,
  WorkItemEstimationNotAllowedException,
} from '../exceptions'

import { WorkItemPriority } from '../enums/work-item-priority.enum'
import { WorkItemStatus } from '../enums/work-item-status.enum'
import { WorkItemType } from '../enums/work-item-type.enum'

import {
  CreateWorkItemProps,
  UpdateWorkItemProps,
  WorkItemProps,
} from '../interfaces/work-item.interface'

import { WorkItemId } from '../value-objects/work-item-id.vo'
import { WorkItemKey } from '../value-objects/work-item-key.vo'

const WORK_ITEM_TITLE_MAX_LENGTH = 250
const WORK_ITEM_DESCRIPTION_MAX_LENGTH = 20_000

/**
 * Aggregate root representing a unit of work owned by a Team.
 *
 * Sprint membership and assignment history are managed by SprintWorkItem.
 * This aggregate owns the Work Item's details, workflow, estimation,
 * hierarchy, user assignment, and lifecycle.
 *
 * Cross-aggregate references must be validated by application use cases.
 */
export class WorkItem extends AggregateRoot<WorkItemId> {
  private readonly _workspaceId: WorkspaceId
  private _projectId: ProjectId | null
  private readonly _teamId: TeamId

  private readonly _key: WorkItemKey
  private readonly _number: number

  private _type: WorkItemType
  private _title: string
  private _description?: string
  private _acceptanceCriteria: readonly string[]

  private _parentId: WorkItemId | null

  private _status: WorkItemStatus
  private _priority: WorkItemPriority | null

  private _assigneeId: UserId | null

  private readonly _createdBy: UserId

  private _storyPoints: number | null

  private _startedAt: Date | null
  private _dueDate: Date | null
  private _completedAt: Date | null

  private _deletedAt: Date | null
  private _deletedBy: UserId | null

  private readonly _createdAt: Date
  private _updatedAt: Date

  constructor(props: WorkItemProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._projectId = props.projectId
    this._teamId = props.teamId

    this._key = props.key
    this._number = props.number

    this._type = props.type
    this._title = this.normalizeTitle(props.title)
    this._description = this.normalizeDescription(props.description)
    this._acceptanceCriteria = this.normalizeAcceptanceCriteria(
      props.acceptanceCriteria
    )

    this._parentId = props.parentId

    this._status = props.status
    this._priority = props.priority
    this._assigneeId = props.assigneeId

    this._createdBy = props.createdBy

    this._storyPoints = props.storyPoints

    this._startedAt = this.cloneNullableDate(props.startedAt)
    this._dueDate = this.cloneNullableDate(props.dueDate)
    this._completedAt = this.cloneNullableDate(props.completedAt)

    this._deletedAt = this.cloneNullableDate(props.deletedAt)
    this._deletedBy = props.deletedBy ?? null

    this._createdAt = this.cloneDate(props.createdAt)
    this._updatedAt = this.cloneDate(props.updatedAt)

    this.validateInvariants()
  }

  // ---------------------------------------------------------------------------
  // Factory methods
  // ---------------------------------------------------------------------------

  /**
   * Creates a new Work Item.
   *
   * Sprint membership is created separately through SprintWorkItem.
   */
  static create(props: CreateWorkItemProps): WorkItem {
    const now = new Date()
    const status = props.status ?? WorkItemStatus.BACKLOG

    const startedAt =
      props.startedAt ??
      (status === WorkItemStatus.IN_PROGRESS || status === WorkItemStatus.DONE
        ? now
        : null)

    const completedAt =
      props.completedAt ?? (status === WorkItemStatus.DONE ? now : null)

    return new WorkItem({
      id: WorkItemId.create(),

      workspaceId: WorkspaceId.create(props.workspaceId),
      projectId: props.projectId ? ProjectId.create(props.projectId) : null,
      teamId: TeamId.create(props.teamId),

      key: props.key,
      number: props.number,

      type: props.type ?? WorkItemType.STORY,
      title: props.title,
      description: props.description,

      acceptanceCriteria: props.acceptanceCriteria ?? [],

      parentId: props.parentId ? WorkItemId.create(props.parentId) : null,

      status,
      priority: props.priority ?? null,

      assigneeId: props.assigneeId ? UserId.create(props.assigneeId) : null,

      createdBy: UserId.create(props.createdBy),

      storyPoints: props.storyPoints ?? null,

      startedAt,
      dueDate: props.dueDate ?? null,
      completedAt,

      deletedAt: null,
      deletedBy: null,

      createdAt: now,
      updatedAt: now,
    })
  }

  /**
   * Reconstitutes a Work Item from persistence.
   */
  static reconstitute(props: WorkItemProps): WorkItem {
    return new WorkItem(props)
  }

  // ---------------------------------------------------------------------------
  // Commands
  // ---------------------------------------------------------------------------

  /**
   * Updates editable Work Item details.
   *
   * Undefined properties are ignored. Nullable references can be cleared
   * explicitly by passing null.
   */
  updateWorkItem(props: UpdateWorkItemProps): void {
    this.assertNotDeleted()

    const nextTitle =
      props.title !== undefined ? this.normalizeTitle(props.title) : this._title

    const nextDescription =
      props.description !== undefined
        ? this.normalizeDescription(props.description)
        : this._description

    const nextAcceptanceCriteria =
      props.acceptanceCriteria !== undefined
        ? this.normalizeAcceptanceCriteria(props.acceptanceCriteria)
        : this._acceptanceCriteria

    const nextType = props.type ?? this._type

    const nextParentId =
      props.parentId !== undefined
        ? this.toWorkItemId(props.parentId)
        : this._parentId

    const nextStatus = props.status ?? this._status

    const nextPriority =
      props.priority !== undefined ? props.priority : this._priority

    const nextAssigneeId =
      props.assigneeId !== undefined
        ? this.toUserId(props.assigneeId)
        : this._assigneeId

    const nextStoryPoints =
      props.storyPoints !== undefined ? props.storyPoints : this._storyPoints

    const nextStartedAt = this.cloneNullableDate(
      props.startedAt !== undefined ? props.startedAt : this._startedAt
    )

    const nextDueDate = this.cloneNullableDate(
      props.dueDate !== undefined ? props.dueDate : this._dueDate
    )

    let nextCompletedAt = this.cloneNullableDate(
      props.completedAt !== undefined ? props.completedAt : this._completedAt
    )

    this.validateStatusTransition(nextStatus)
    this.validateParent(nextParentId)
    this.validateStoryPoints(nextStoryPoints)

    const now = new Date()

    let effectiveStartedAt = nextStartedAt

    if (
      nextStatus === WorkItemStatus.IN_PROGRESS ||
      nextStatus === WorkItemStatus.DONE
    ) {
      effectiveStartedAt ??= now
    }

    if (nextStatus === WorkItemStatus.DONE) {
      nextCompletedAt ??= now
    } else {
      nextCompletedAt = null
    }

    this.validateDates({
      startedAt: effectiveStartedAt,
      dueDate: nextDueDate,
      completedAt: nextCompletedAt,
    })

    this._title = nextTitle
    this._description = nextDescription
    this._acceptanceCriteria = [...nextAcceptanceCriteria]

    this._type = nextType
    this._parentId = nextParentId

    this._status = nextStatus
    this._priority = nextPriority
    this._assigneeId = nextAssigneeId

    this._storyPoints = nextStoryPoints

    this._startedAt = effectiveStartedAt
    this._dueDate = nextDueDate
    this._completedAt = nextCompletedAt
    this._updatedAt = now
  }

  /**
   * Changes the Work Item's workflow status.
   */
  changeStatus(status: WorkItemStatus): void {
    this.assertNotDeleted()
    this.transitionTo(status, new Date())
  }

  /**
   * Assigns the Work Item to a user.
   */
  assignTo(assigneeId: UserId | null): void {
    this.assertNotDeleted()

    this._assigneeId = assigneeId
  }

  /**
   * Changes or clears the Project association.
   *
   * Project existence and workspace ownership are validated by the
   * application use case.
   */
  assignToProject(projectId: ProjectId | null): void {
    this.assertNotDeleted()

    this._projectId = projectId
  }

  /**
   * Changes the Work Item priority.
   */
  changePriority(priority: WorkItemPriority | null): void {
    this.assertNotDeleted()

    this._priority = priority
  }

  /**
   * Changes the Work Item type.
   */
  changeType(type: WorkItemType): void {
    this.assertNotDeleted()

    this._type = type
  }

  /**
   * Sets the parent Work Item.
   *
   * Cross-aggregate parent existence, workspace ownership, compatible
   * hierarchy, and circular relationships must be validated externally.
   */
  setParent(parentId: WorkItemId | null): void {
    this.assertNotDeleted()
    this.validateParent(parentId)

    this._parentId = parentId
  }

  /**
   * Updates the Work Item estimate.
   */
  estimate(storyPoints: number | null): void {
    this.assertNotDeleted()
    this.validateStoryPoints(storyPoints)

    this._storyPoints = storyPoints
  }

  /**
   * Starts the Work Item.
   */
  start(startedAt: Date = new Date()): void {
    this.assertNotDeleted()
    this.transitionTo(WorkItemStatus.IN_PROGRESS, startedAt)
  }

  /**
   * Completes the Work Item.
   */
  complete(completedAt: Date = new Date()): void {
    this.assertNotDeleted()
    this.transitionTo(WorkItemStatus.DONE, completedAt)
  }

  /**
   * Cancels the Work Item.
   */
  cancel(at: Date = new Date()): void {
    this.assertNotDeleted()
    this.transitionTo(WorkItemStatus.CANCELLED, at)
  }

  /**
   * Soft-deletes the Work Item and records the deleting user.
   */
  delete(deletedBy: UserId, at: Date = new Date()): void {
    if (this.isDeleted) {
      throw new WorkItemAlreadyDeletedException()
    }

    this.assertValidDate(at, 'Deletion timestamp')

    this._deletedAt = this.cloneDate(at)
    this._deletedBy = deletedBy
    this._updatedAt = this.cloneDate(at)
  }

  /**
   * Restores a soft-deleted Work Item.
   */
  restore(at: Date = new Date()): void {
    if (!this.isDeleted) {
      throw new WorkItemNotDeletedException()
    }

    this.assertValidDate(at, 'Restoration timestamp')

    this._deletedAt = null
    this._deletedBy = null
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  private transitionTo(status: WorkItemStatus, at: Date): void {
    this.assertValidDate(at, 'Status transition timestamp')
    this.validateStatusTransition(status)

    if (status === this._status) {
      return
    }

    let nextStartedAt = this._startedAt

    if (
      (status === WorkItemStatus.IN_PROGRESS ||
        status === WorkItemStatus.DONE) &&
      nextStartedAt === null
    ) {
      nextStartedAt = this.cloneDate(at)
    }

    const nextCompletedAt =
      status === WorkItemStatus.DONE ? this.cloneDate(at) : null

    this.validateDates({
      startedAt: nextStartedAt,
      dueDate: this._dueDate,
      completedAt: nextCompletedAt,
    })

    this._status = status
    this._startedAt = nextStartedAt
    this._completedAt = nextCompletedAt
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  get id(): WorkItemId {
    return this._id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get projectId(): ProjectId | null {
    return this._projectId
  }

  get teamId(): TeamId {
    return this._teamId
  }

  get key(): WorkItemKey {
    return this._key
  }

  get number(): number {
    return this._number
  }

  get type(): WorkItemType {
    return this._type
  }

  get title(): string {
    return this._title
  }

  get description(): string | undefined {
    return this._description
  }

  get acceptanceCriteria(): readonly string[] {
    return [...this._acceptanceCriteria]
  }

  get parentId(): WorkItemId | null {
    return this._parentId
  }

  get status(): WorkItemStatus {
    return this._status
  }

  get priority(): WorkItemPriority | null {
    return this._priority
  }

  get assigneeId(): UserId | null {
    return this._assigneeId
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  get storyPoints(): number | null {
    return this._storyPoints
  }

  get startedAt(): Date | null {
    return this.cloneNullableDate(this._startedAt)
  }

  get dueDate(): Date | null {
    return this.cloneNullableDate(this._dueDate)
  }

  get completedAt(): Date | null {
    return this.cloneNullableDate(this._completedAt)
  }

  get deletedAt(): Date | null {
    return this.cloneNullableDate(this._deletedAt)
  }

  get deletedBy(): UserId | null {
    return this._deletedBy
  }

  get createdAt(): Date {
    return this.cloneDate(this._createdAt)
  }

  get updatedAt(): Date {
    return this.cloneDate(this._updatedAt)
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null
  }

  get isCompleted(): boolean {
    return this._status === WorkItemStatus.DONE
  }

  get isInProgress(): boolean {
    return this._status === WorkItemStatus.IN_PROGRESS
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  private assertNotDeleted(): void {
    if (this.isDeleted) {
      throw new WorkItemDeletedException()
    }
  }

  private validateInvariants(): void {
    this.validateTitle(this._title)
    this.validateStoryPoints(this._storyPoints)
    this.validateParent(this._parentId)

    this.validateDates({
      startedAt: this._startedAt,
      dueDate: this._dueDate,
      completedAt: this._completedAt,
    })

    this.assertValidDate(this._createdAt, 'Creation timestamp')
    this.assertValidDate(this._updatedAt, 'Update timestamp')

    if (this._updatedAt < this._createdAt) {
      throw new TypeError(
        'Work Item update timestamp cannot precede its creation timestamp.'
      )
    }

    if (this._deletedAt !== null) {
      this.assertValidDate(this._deletedAt, 'Deletion timestamp')
    }

    if (this._deletedAt === null && this._deletedBy !== null) {
      throw new TypeError(
        'A non-deleted Work Item cannot have a deleting user.'
      )
    }

    if (this._status === WorkItemStatus.DONE && this._completedAt === null) {
      throw new TypeError(
        'A completed Work Item must have a completion timestamp.'
      )
    }

    if (this._status !== WorkItemStatus.DONE && this._completedAt !== null) {
      throw new TypeError(
        'Only a completed Work Item can have a completion timestamp.'
      )
    }

    if (
      (this._status === WorkItemStatus.IN_PROGRESS ||
        this._status === WorkItemStatus.DONE) &&
      this._startedAt === null
    ) {
      throw new TypeError(
        'An in-progress or completed Work Item must have a start timestamp.'
      )
    }
  }

  private validateTitle(title: string): void {
    if (!title.trim()) {
      throw new WorkItemTitleNotAllowedException()
    }

    if (title.length > WORK_ITEM_TITLE_MAX_LENGTH) {
      throw new RangeError(
        `Work Item title cannot exceed ${WORK_ITEM_TITLE_MAX_LENGTH} characters.`
      )
    }
  }

  private validateParent(parentId: WorkItemId | null): void {
    if (parentId?.equals(this._id)) {
      throw new WorkItemSelfParentException()
    }
  }

  private validateStoryPoints(storyPoints: number | null): void {
    if (
      storyPoints !== null &&
      (!Number.isFinite(storyPoints) ||
        !Number.isInteger(storyPoints) ||
        storyPoints < 1)
    ) {
      throw new WorkItemEstimationNotAllowedException()
    }
  }

  private validateStatusTransition(targetStatus: WorkItemStatus): void {
    if (targetStatus === this._status) {
      return
    }

    const allowedTransitions = WorkItem.STATUS_TRANSITIONS[this._status]

    if (!allowedTransitions.includes(targetStatus)) {
      throw new WorkItemInvalidStatusTransitionException(
        this._status,
        targetStatus
      )
    }
  }

  private validateDates(params: {
    readonly startedAt: Date | null
    readonly dueDate: Date | null
    readonly completedAt: Date | null
  }): void {
    const { startedAt, dueDate, completedAt } = params

    if (startedAt !== null) {
      this.assertValidDate(startedAt, 'Start timestamp')
    }

    if (dueDate !== null) {
      this.assertValidDate(dueDate, 'Due date')
    }

    if (completedAt !== null) {
      this.assertValidDate(completedAt, 'Completion timestamp')
    }

    if (startedAt !== null && completedAt !== null && completedAt < startedAt) {
      throw new WorkItemCompletedBeforeStartedException()
    }

    // A due date earlier than the actual start date indicates overdue work,
    // not an invalid Work Item.
  }

  // ---------------------------------------------------------------------------
  // Normalization and helpers
  // ---------------------------------------------------------------------------

  private normalizeTitle(title: string): string {
    const normalized = title.trim()

    this.validateTitle(normalized)

    return normalized
  }

  private normalizeDescription(
    description: string | null | undefined
  ): string | undefined {
    const normalized = description?.trim()

    if (!normalized) {
      return undefined
    }

    if (normalized.length > WORK_ITEM_DESCRIPTION_MAX_LENGTH) {
      throw new RangeError(
        `Work Item description cannot exceed ${WORK_ITEM_DESCRIPTION_MAX_LENGTH} characters.`
      )
    }

    return normalized
  }

  private normalizeAcceptanceCriteria(
    criteria: readonly string[]
  ): readonly string[] {
    return criteria.map((criterion) => criterion.trim()).filter(Boolean)
  }

  private toWorkItemId(id: string | null): WorkItemId | null {
    return id ? WorkItemId.create(id) : null
  }

  private toUserId(id: string | null): UserId | null {
    return id ? UserId.create(id) : null
  }

  private assertValidDate(date: Date, fieldName: string): void {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError(`${fieldName} must be a valid date.`)
    }
  }

  private cloneDate(date: Date): Date {
    return new Date(date.getTime())
  }

  private cloneNullableDate(date: Date | null | undefined): Date | null {
    return date == null ? null : this.cloneDate(date)
  }

  // ---------------------------------------------------------------------------
  // Domain policies
  // ---------------------------------------------------------------------------

  private static readonly STATUS_TRANSITIONS: Record<
    WorkItemStatus,
    readonly WorkItemStatus[]
  > = {
    [WorkItemStatus.BACKLOG]: [
      WorkItemStatus.TODO,
      WorkItemStatus.IN_PROGRESS,
      WorkItemStatus.CANCELLED,
    ],

    [WorkItemStatus.TODO]: [
      WorkItemStatus.BACKLOG,
      WorkItemStatus.IN_PROGRESS,
      WorkItemStatus.CANCELLED,
    ],

    [WorkItemStatus.IN_PROGRESS]: [
      WorkItemStatus.TODO,
      WorkItemStatus.IN_REVIEW,
      WorkItemStatus.DONE,
      WorkItemStatus.CANCELLED,
    ],

    [WorkItemStatus.IN_REVIEW]: [
      WorkItemStatus.IN_PROGRESS,
      WorkItemStatus.DONE,
      WorkItemStatus.CANCELLED,
    ],

    [WorkItemStatus.DONE]: [WorkItemStatus.IN_PROGRESS],

    [WorkItemStatus.CANCELLED]: [WorkItemStatus.TODO],
  }
}
