import { AggregateRoot } from '@/shared/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  ProjectAvatar,
  ProjectDescription,
  ProjectId,
  ProjectKey,
  ProjectName,
  ProjectProgress,
  ProjectResource,
} from '../value-objects'
import { ProjectPriority, ProjectStatus, ProjectType } from '../enums'
import { UserId } from '@/modules/user/domain'
import { CreateProjectProps, ProjectProps } from '../interfaces'

export class Project extends AggregateRoot<ProjectId> {
  private _workspaceId: WorkspaceId

  private _name: ProjectName

  private _key: ProjectKey

  private _description?: ProjectDescription

  private _resources?: ProjectResource[]

  private _avatarUrl?: ProjectAvatar

  private _startDate?: Date

  private _targetEndDate?: Date

  private _type?: ProjectType

  private _priority: ProjectPriority

  private _leadId?: UserId

  private _status: ProjectStatus

  private _progress: ProjectProgress

  private readonly _createdAt: Date

  private _updatedAt: Date

  private readonly _createdBy: UserId

  private constructor(props: ProjectProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._name = props.name
    this._key = props.key
    this._description = props.description
    this._resources = props.resources
    this._avatarUrl = props.avatar
    this._startDate = props.startDate
    this._targetEndDate = props.targetEndDate
    this._type = props.type
    this._priority = props.priority
    this._leadId = props.leadId
    this._status = props.status
    this._progress = props.progress
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
    this._createdBy = props.createdBy
  }

  get projectId(): ProjectId {
    return this.id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get name(): ProjectName {
    return this._name
  }

  get key(): ProjectKey {
    return this._key
  }

  get description(): ProjectDescription | undefined {
    return this._description
  }

  get resources(): ProjectResource[] | undefined {
    return this._resources
  }

  get avatarUrl(): ProjectAvatar | undefined {
    return this._avatarUrl
  }

  get startDate(): Date | undefined {
    return this._startDate
  }

  get targetEndDate(): Date | undefined {
    return this._targetEndDate
  }

  get type(): ProjectType | undefined {
    return this._type
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

  get progress(): ProjectProgress {
    return this._progress
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  static create(props: CreateProjectProps) {
    const projectId = ProjectId.create()
    const now = new Date()

    return new Project({
      id: projectId,
      workspaceId: props.workspaceId,
      name: props.name,
      key: props.key,
      description: props.description,
      resources: props.resources,
      avatar: props.avatar,
      startDate: props.startDate,
      targetEndDate: props.targetEndDate,
      type: props.type,
      priority: props.priority ?? ProjectPriority.NO_PRIORITY,
      leadId: props.leadId,
      status: ProjectStatus.ACTIVE,
      progress: ProjectProgress.zero(),
      createdBy: props.createdBy,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: ProjectProps): Project {
    return new Project(props)
  }

  rename() {}

  changeDescription() {}

  changeLead() {}

  changePriority() {}

  changeStatus() {}

  changeProjectType() {}

  changeTimeline() {}

  changeAvatar() {}

  addResource() {}

  removeResource() {}

  updateProgress() {}

  complete() {}

  pause() {}

  resume() {}

  cancel() {}

  isCompleted() {}

  isActive() {}

  isPaused() {}

  touch() {}
}
