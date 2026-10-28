export const WORK_ITEM_TYPES = {
  EPIC: 'epic',
  STORY: 'story',
  TASK: 'task',
  BUG: 'bug',
} as const

export type WorkItemType =
  (typeof WORK_ITEM_TYPES)[keyof typeof WORK_ITEM_TYPES]

export const WORK_ITEM_STATUSES = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const

export type WorkItemStatus =
  (typeof WORK_ITEM_STATUSES)[keyof typeof WORK_ITEM_STATUSES]

export const WORK_ITEM_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export type WorkItemPriority =
  (typeof WORK_ITEM_PRIORITIES)[keyof typeof WORK_ITEM_PRIORITIES]

export interface WorkItemAssigneeSummary {
  readonly id: string
  readonly name: string
  readonly avatarUrl?: string | null
}

/** Sprint membership is a read-model projection; it is not stored on WorkItem. */
export interface WorkItemSprintSummary {
  readonly id: string
  readonly name: string
}

/** Minimal Work Item read model shared by type-specific list views. */
export interface WorkItemSummary {
  readonly id: string
  readonly key: string
  readonly type: WorkItemType
  readonly title: string
  readonly status: WorkItemStatus
  readonly priority: WorkItemPriority | null
  readonly assigneeId: string | null
  readonly assignee?: WorkItemAssigneeSummary | null
  readonly storyPoints: number | null
  readonly sprint?: WorkItemSprintSummary | null
}
