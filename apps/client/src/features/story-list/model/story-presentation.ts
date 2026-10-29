import {
  WORK_ITEM_PRIORITIES,
  WORK_ITEM_STATUSES,
  type WorkItemPriority,
  type WorkItemStatus,
} from '@/entities/work-item'

export const STORY_STATUS_OPTIONS = [
  { value: WORK_ITEM_STATUSES.BACKLOG, label: 'Backlog' },
  { value: WORK_ITEM_STATUSES.TODO, label: 'To do' },
  { value: WORK_ITEM_STATUSES.IN_PROGRESS, label: 'In progress' },
  { value: WORK_ITEM_STATUSES.IN_REVIEW, label: 'In review' },
  { value: WORK_ITEM_STATUSES.DONE, label: 'Done' },
  { value: WORK_ITEM_STATUSES.CANCELLED, label: 'Cancelled' },
] as const

export const STORY_PRIORITY_OPTIONS = [
  { value: WORK_ITEM_PRIORITIES.URGENT, label: 'Urgent' },
  { value: WORK_ITEM_PRIORITIES.HIGH, label: 'High' },
  { value: WORK_ITEM_PRIORITIES.MEDIUM, label: 'Medium' },
  { value: WORK_ITEM_PRIORITIES.LOW, label: 'Low' },
] as const

export const STORY_STATUS_STYLES: Record<
  WorkItemStatus,
  {
    readonly badge: string
    readonly column: string
    readonly indicator: string
  }
> = {
  [WORK_ITEM_STATUSES.BACKLOG]: {
    badge: 'bg-muted text-muted-foreground',
    column: 'bg-muted/40',
    indicator: 'bg-foreground/35',
  },
  [WORK_ITEM_STATUSES.TODO]: {
    badge:
      'border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
    column: 'bg-sky-500/5',
    indicator: 'bg-sky-500/70',
  },
  [WORK_ITEM_STATUSES.IN_PROGRESS]: {
    badge:
      'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
    column: 'bg-blue-500/5',
    indicator: 'bg-blue-500/60',
  },
  [WORK_ITEM_STATUSES.IN_REVIEW]: {
    badge:
      'border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
    column: 'bg-violet-500/5',
    indicator: 'bg-violet-500/60',
  },
  [WORK_ITEM_STATUSES.DONE]: {
    badge:
      'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    column: 'bg-emerald-500/5',
    indicator: 'bg-emerald-500/60',
  },
  [WORK_ITEM_STATUSES.CANCELLED]: {
    badge: 'bg-muted text-muted-foreground line-through',
    column: 'bg-rose-500/5',
    indicator: 'bg-rose-500/60',
  },
}

export function getStoryStatusLabel(status: WorkItemStatus): string {
  return (
    STORY_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  )
}

export function getStoryStatusStyle(status: WorkItemStatus) {
  return (
    STORY_STATUS_STYLES[status] ??
    STORY_STATUS_STYLES[WORK_ITEM_STATUSES.BACKLOG]
  )
}

export function getStoryPriorityLabel(priority: WorkItemPriority): string {
  return (
    STORY_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ??
    priority
  )
}
