import { ProjectId } from '@/modules/project/domain'
import { SprintId } from '@/modules/sprint/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { WorkItemPriority } from '../enums/work-item-priority.enum'
import { WorkItemStatus } from '../enums/work-item-status.enum'
import { WorkItemType } from '../enums/work-item-type.enum'
import { WorkItemId } from '../value-objects/work-item-id.vo'

export interface WorkItemProps {
  readonly id: WorkItemId

  readonly workspaceId: WorkspaceId
  readonly projectId: ProjectId
  readonly teamId: TeamId

  readonly type: WorkItemType

  readonly key: string
  readonly number: number

  readonly title: string
  readonly description?: string
  readonly acceptanceCriteria: readonly string[]

  readonly parentId: WorkItemId | null

  readonly status: WorkItemStatus
  readonly priority: WorkItemPriority | null

  readonly sprintId: SprintId | null

  readonly assigneeId: UserId | null
  readonly createdBy: UserId

  readonly storyPoints: number | null

  readonly startedAt: Date | null
  readonly dueDate: Date | null
  readonly completedAt: Date | null

  readonly createdAt: Date
  readonly updatedAt: Date

  readonly deletedAt: Date | null
}

export interface CreateWorkItemProps {
  readonly workspaceId: string
  readonly projectId: string
  readonly teamId: string

  readonly type?: WorkItemType

  readonly key: string
  readonly number: number

  readonly title: string
  readonly description?: string | null
  readonly acceptanceCriteria?: readonly string[]

  readonly parentId?: string | null

  readonly status?: WorkItemStatus
  readonly priority?: WorkItemPriority | null

  readonly sprintId?: string | null

  readonly assigneeId?: string | null
  readonly createdBy: string

  readonly storyPoints?: number | null

  readonly startedAt?: Date | null
  readonly dueDate?: Date | null
  readonly completedAt?: Date | null
}

export interface UpdateWorkItemProps {
  readonly type?: WorkItemType

  readonly title?: string
  readonly description?: string | null
  readonly acceptanceCriteria?: readonly string[]

  readonly parentId?: string | null

  readonly status?: WorkItemStatus
  readonly priority?: WorkItemPriority | null

  readonly sprintId?: string | null

  readonly assigneeId?: string | null

  readonly storyPoints?: number | null

  readonly startedAt?: Date | null
  readonly dueDate?: Date | null
  readonly completedAt?: Date | null
}
