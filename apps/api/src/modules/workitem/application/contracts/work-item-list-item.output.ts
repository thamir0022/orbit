import { UserSummaryOutput } from '@/shared/application/contracts'

import { WorkItemPriority } from '../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../domain/enums/work-item-type.enum'

export interface WorkItemListItemOutput {
  id: string

  key: string
  number: number

  type: WorkItemType
  title: string
  description?: string

  status: WorkItemStatus
  priority: WorkItemPriority | null

  storyPoints: number | null

  sprintId: string | null
  parentId: string | null

  assignee: UserSummaryOutput | null
  createdBy: UserSummaryOutput

  startedAt: Date | null
  dueDate: Date | null
  completedAt: Date | null

  createdAt: Date
  updatedAt: Date
}
