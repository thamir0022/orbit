import { WorkItemPriority } from '../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../domain/enums/work-item-type.enum'

/**
 * Application-layer representation of a WorkItem.
 *
 * This contract exposes the immutable state required by
 * application use cases without exposing the WorkItem's
 * internal mutable implementation.
 */
export interface WorkItemContract {
  readonly id: string

  readonly workspaceId: string
  readonly projectId: string
  readonly teamId: string

  readonly type: WorkItemType

  readonly key: string
  readonly number: number

  readonly title: string
  readonly description?: string
  readonly acceptanceCriteria: readonly string[]

  readonly parentId: string | null

  readonly status: WorkItemStatus
  readonly priority: WorkItemPriority | null

  readonly sprintId: string | null
  readonly assigneeId: string | null

  readonly createdBy: string

  readonly storyPoints: number | null

  readonly startedAt: Date | null
  readonly dueDate: Date | null
  readonly completedAt: Date | null

  readonly createdAt: Date
  readonly updatedAt: Date

  readonly deletedAt: Date | null
}
