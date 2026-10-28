import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronsUp,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { Story } from '@/entities/story'
import type {
  WorkItemPriority,
  WorkItemStatus,
} from '@/entities/work-item'
import { getInitials } from '@/shared/lib/get-initials'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'

import { storyTableFeatures } from '../model/story-table-features'

function getStatusLabel(status: WorkItemStatus): string {
  const labels: Record<WorkItemStatus, string> = {
    BACKLOG: 'Backlog',
    TODO: 'To do',
    IN_PROGRESS: 'In progress',
    IN_REVIEW: 'In review',
    DONE: 'Done',
    CANCELLED: 'Cancelled',
  }

  return labels[status]
}

function getStatusClassName(status: WorkItemStatus): string {
  const classes: Record<WorkItemStatus, string> = {
    BACKLOG: 'bg-muted text-muted-foreground',
    TODO: 'bg-secondary text-secondary-foreground',
    IN_PROGRESS:
      'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
    IN_REVIEW:
      'border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
    DONE: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    CANCELLED: 'bg-muted text-muted-foreground line-through',
  }

  return classes[status]
}

function PriorityContent({ priority }: { readonly priority: WorkItemPriority | null }) {
  if (!priority) {
    return <span className="text-muted-foreground">—</span>
  }

  const config: Record<
    WorkItemPriority,
    { label: string; className: string; icon: typeof ArrowRight }
  > = {
    URGENT: { label: 'Urgent', className: 'text-rose-600', icon: ChevronsUp },
    HIGH: { label: 'High', className: 'text-orange-600', icon: ArrowUp },
    MEDIUM: { label: 'Medium', className: 'text-amber-600', icon: ArrowRight },
    LOW: { label: 'Low', className: 'text-sky-600', icon: ArrowDown },
  }

  const item = config[priority]
  const Icon = item.icon

  return (
    <span className={`inline-flex items-center gap-1.5 ${item.className}`}>
      <Icon aria-hidden="true" className="size-3.5" />
      <span>{item.label}</span>
    </span>
  )
}

export const storyTableColumns: ColumnDef<typeof storyTableFeatures, Story>[] = [
  {
    accessorFn: (story) => story.title,
    id: 'story',
    header: 'Story',
    enableSorting: true,
    cell: ({ row }) => {
      const story = row.original

      return (
        <div className="flex min-w-56 flex-col gap-1 py-0.5">
          <span className="font-mono text-xs text-muted-foreground">{story.key}</span>
          <span className="line-clamp-2 font-medium leading-5 text-foreground">
            {story.title}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: true,
    cell: ({ getValue }) => {
      const status = getValue<WorkItemStatus>()

      return (
        <Badge
          variant="secondary"
          className={`whitespace-nowrap font-normal ${getStatusClassName(status)}`}
        >
          {getStatusLabel(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    enableSorting: true,
    cell: ({ getValue }) => (
      <PriorityContent priority={getValue<WorkItemPriority | null>()} />
    ),
  },
  {
    accessorFn: (story) => story.assignee?.name ?? 'Unassigned',
    id: 'assignee',
    header: 'Assignee',
    enableSorting: true,
    cell: ({ row }) => {
      const assignee = row.original.assignee

      if (!assignee) {
        return <span className="text-sm text-muted-foreground">Unassigned</span>
      }

      return (
        <div className="flex min-w-28 items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={assignee.avatarUrl ?? undefined} alt={assignee.name} />
            <AvatarFallback className="text-[10px]">
              {getInitials(assignee.name)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm">{assignee.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'storyPoints',
    header: 'Points',
    enableSorting: true,
    cell: ({ getValue }) => {
      const points = getValue<number | null>()

      return (
        <span className="tabular-nums text-sm text-muted-foreground">
          {points ?? '—'}
        </span>
      )
    },
  },
  {
    accessorFn: (story) => story.sprint?.name ?? 'Backlog',
    id: 'sprint',
    header: 'Sprint',
    enableSorting: true,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.original.sprint?.name ?? 'Backlog'}
      </span>
    ),
  },
]
