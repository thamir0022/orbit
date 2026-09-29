import { ProjectId } from '@/modules/project/domain'
import { SprintId } from '@/modules/sprint/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { WorkItemPriority } from '../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../domain/enums/work-item-type.enum'
import { WorkItemId } from '../../domain/value-objects/work-item-id.vo'

/**
 * Application-layer representation of a WorkItem.
 *
 * This contract exposes the immutable state required by
 * application use cases without exposing the WorkItem's
 * internal mutable implementation.
 */
export interface WorkItemContract {
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
