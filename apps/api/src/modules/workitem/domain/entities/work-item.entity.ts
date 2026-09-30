import { ProjectId } from '@/modules/project/domain'
import { SprintId } from '@/modules/sprint/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { AggregateRoot } from '@/shared/domain'

import {
  WorkItemAlreadyDeletedException,
  WorkItemCompletedBeforeStartedException,
  WorkItemDeletedException,
  WorkItemDueDateBeforeStartedException,
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

export class WorkItem extends AggregateRoot<WorkItemId> {
  private readonly _workspaceId: WorkspaceId
  private readonly _projectId: ProjectId
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

  private _sprintId: SprintId | null
  private _assigneeId: UserId | null

  private readonly _createdBy: UserId

  private _storyPoints: number | null

  private _startedAt: Date | null
  private _dueDate: Date | null
  private _completedAt: Date | null

  private _deletedAt: Date | null

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
    this._title = props.title
    this._description = props.description
    this._acceptanceCriteria = [...props.acceptanceCriteria]

    this._parentId = props.parentId

    this._status = props.status
    this._priority = props.priority

    this._sprintId = props.sprintId
    this._assigneeId = props.assigneeId

    this._createdBy = props.createdBy

    this._storyPoints = props.storyPoints

    this._startedAt = props.startedAt
    this._dueDate = props.dueDate
    this._completedAt = props.completedAt

    this._deletedAt = props.deletedAt

    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt

    this.validateInvariants()
  }

  // ---------------------------------------------------------------------------
  // Factory methods
  // ---------------------------------------------------------------------------

  static create(props: CreateWorkItemProps): WorkItem {
    const now = new Date()

    return new WorkItem({
      id: WorkItemId.create(),

      workspaceId: WorkspaceId.create(props.workspaceId),
      projectId: ProjectId.create(props.projectId),
      teamId: TeamId.create(props.teamId),

      type: props.type ?? WorkItemType.STORY,

      key: props.key,
      number: props.number,

      title: props.title.trim(),
      description: props.description?.trim(),

      acceptanceCriteria:
        props.acceptanceCriteria?.map((criterion) => criterion.trim()) ?? [],

      parentId: props.parentId ? WorkItemId.create(props.parentId) : null,

      status: props.status ?? WorkItemStatus.BACKLOG,
      priority: props.priority ?? null,

      sprintId: props.sprintId ? SprintId.create(props.sprintId) : null,

      assigneeId: props.assigneeId ? UserId.create(props.assigneeId) : null,

      createdBy: UserId.create(props.createdBy),

      storyPoints: props.storyPoints ?? null,

      startedAt: props.startedAt ?? null,
      dueDate: props.dueDate ?? null,
      completedAt: props.completedAt ?? null,

      deletedAt: null,

      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: WorkItemProps): WorkItem {
    return new WorkItem(props)
  }

  // ---------------------------------------------------------------------------
  // Commands
  // ---------------------------------------------------------------------------

  updateWorkItem(props: UpdateWorkItemProps): void {
    this.assertNotDeleted()

    const nextTitle =
      props.title !== undefined ? props.title.trim() : this._title

    const nextDescription =
      props.description !== undefined
        ? props.description?.trim()
        : this._description

    const nextAcceptanceCriteria =
      props.acceptanceCriteria !== undefined
        ? props.acceptanceCriteria.map((criterion) => criterion.trim())
        : this._acceptanceCriteria

    const nextType = props.type ?? this._type

    const nextParentId =
      props.parentId !== undefined
        ? this.toWorkItemId(props.parentId)
        : this._parentId

    const nextStatus = props.status ?? this._status

    const nextPriority =
      props.priority !== undefined ? props.priority : this._priority

    const nextSprintId =
      props.sprintId !== undefined
        ? this.toSprintId(props.sprintId)
        : this._sprintId

    const nextAssigneeId =
      props.assigneeId !== undefined
        ? this.toUserId(props.assigneeId)
        : this._assigneeId

    const nextStoryPoints =
      props.storyPoints !== undefined ? props.storyPoints : this._storyPoints

    const nextStartedAt =
      props.startedAt !== undefined ? props.startedAt : this._startedAt

    const nextDueDate =
      props.dueDate !== undefined ? props.dueDate : this._dueDate

    let nextCompletedAt =
      props.completedAt !== undefined ? props.completedAt : this._completedAt

    this.validateTitle(nextTitle)

    this.validateParent(nextParentId)

    this.validateStatusTransition(nextStatus)

    this.validateStoryPoints(nextStoryPoints)

    this.validateDates({
      startedAt: nextStartedAt,
      dueDate: nextDueDate,
      completedAt: nextCompletedAt,
    })

    if (nextStatus === WorkItemStatus.DONE && nextCompletedAt === null) {
      nextCompletedAt = new Date()
    }

    if (nextStatus !== WorkItemStatus.DONE) {
      nextCompletedAt = null
    }

    this._title = nextTitle
    this._description = nextDescription
    this._acceptanceCriteria = [...nextAcceptanceCriteria]
    this._type = nextType
    this._parentId = nextParentId
    this._status = nextStatus
    this._priority = nextPriority
    this._sprintId = nextSprintId
    this._assigneeId = nextAssigneeId
    this._storyPoints = nextStoryPoints
    this._startedAt = nextStartedAt
    this._dueDate = nextDueDate
    this._completedAt = nextCompletedAt

    this.touch()
  }

  changeStatus(status: WorkItemStatus): void {
    this.assertNotDeleted()
    this.validateStatusTransition(status)

    if (status === this._status) {
      return
    }

    const now = new Date()

    this._status = status

    if (status === WorkItemStatus.IN_PROGRESS) {
      this._startedAt ??= now
    }

    this._completedAt =
      status === WorkItemStatus.DONE ? (this._completedAt ?? now) : null

    this.touch()
  }

  assignTo(assigneeId: UserId | null): void {
    this.assertNotDeleted()

    this._assigneeId = assigneeId

    this.touch()
  }

  moveToSprint(sprintId: SprintId | null): void {
    this.assertNotDeleted()

    this._sprintId = sprintId

    this.touch()
  }

  changePriority(priority: WorkItemPriority | null): void {
    this.assertNotDeleted()

    this._priority = priority

    this.touch()
  }

  changeType(type: WorkItemType): void {
    this.assertNotDeleted()

    this._type = type

    this.touch()
  }

  setParent(parentId: WorkItemId | null): void {
    this.assertNotDeleted()
    this.validateParent(parentId)

    this._parentId = parentId

    this.touch()
  }

  estimate(storyPoints: number | null): void {
    this.assertNotDeleted()
    this.validateStoryPoints(storyPoints)

    this._storyPoints = storyPoints

    this.touch()
  }

  start(startedAt: Date = new Date()): void {
    this.assertNotDeleted()
    this.validateStatusTransition(WorkItemStatus.IN_PROGRESS)

    const nextStartedAt = this._startedAt ?? startedAt

    this.validateDates({
      startedAt: nextStartedAt,
      dueDate: this._dueDate,
      completedAt: this._completedAt,
    })

    this._status = WorkItemStatus.IN_PROGRESS
    this._startedAt = nextStartedAt

    this.touch()
  }

  complete(completedAt: Date = new Date()): void {
    this.assertNotDeleted()
    this.validateStatusTransition(WorkItemStatus.DONE)

    this.validateDates({
      startedAt: this._startedAt,
      dueDate: this._dueDate,
      completedAt,
    })

    this._status = WorkItemStatus.DONE
    this._completedAt = completedAt

    this.touch()
  }

  cancel(): void {
    this.assertNotDeleted()
    this.validateStatusTransition(WorkItemStatus.CANCELLED)

    this._status = WorkItemStatus.CANCELLED
    this._completedAt = null

    this.touch()
  }

  delete(): void {
    if (this._deletedAt) {
      throw new WorkItemAlreadyDeletedException()
    }

    this._deletedAt = new Date()

    this.touch()
  }

  restore(): void {
    if (!this._deletedAt) {
      throw new WorkItemNotDeletedException()
    }

    this._deletedAt = null

    this.touch()
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

  get projectId(): ProjectId {
    return this._projectId
  }

  get teamId(): TeamId {
    return this._teamId
  }

  get type(): WorkItemType {
    return this._type
  }

  get key(): WorkItemKey {
    return this._key
  }

  get number(): number {
    return this._number
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

  get sprintId(): SprintId | null {
    return this._sprintId
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
    return this._startedAt ? new Date(this._startedAt) : null
  }

  get dueDate(): Date | null {
    return this._dueDate ? new Date(this._dueDate) : null
  }

  get completedAt(): Date | null {
    return this._completedAt ? new Date(this._completedAt) : null
  }

  get createdAt(): Date {
    return new Date(this._createdAt)
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt)
  }

  get deletedAt(): Date | null {
    return this._deletedAt ? new Date(this._deletedAt) : null
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
    if (this._deletedAt) {
      throw new WorkItemDeletedException()
    }
  }

  private validateInvariants(): void {
    this.validateParent(this._parentId)
    this.validateStoryPoints(this._storyPoints)

    this.validateDates({
      startedAt: this._startedAt,
      dueDate: this._dueDate,
      completedAt: this._completedAt,
    })
  }

  private validateTitle(title: string): void {
    if (!title) {
      throw new WorkItemTitleNotAllowedException()
    }
  }

  private validateParent(parentId: WorkItemId | null): void {
    if (parentId?.equals(this._id)) {
      throw new WorkItemSelfParentException()
    }
  }

  private validateStoryPoints(storyPoints: number | null): void {
    if (storyPoints !== null && storyPoints <= 0) {
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

    if (startedAt && completedAt && completedAt < startedAt) {
      throw new WorkItemCompletedBeforeStartedException()
    }

    if (startedAt && dueDate && dueDate < startedAt) {
      throw new WorkItemDueDateBeforeStartedException()
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private toWorkItemId(id: string | null): WorkItemId | null {
    return id ? WorkItemId.create(id) : null
  }

  private toSprintId(id: string | null): SprintId | null {
    return id ? SprintId.create(id) : null
  }

  private toUserId(id: string | null): UserId | null {
    return id ? UserId.create(id) : null
  }

  private touch(): void {
    this._updatedAt = new Date()
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
