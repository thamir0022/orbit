'use client'

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronsUp,
  ChevronsUpDown,
} from 'lucide-react'
import { createColumnHelper, type Column } from '@tanstack/react-table'

import type { Story } from '@/entities/story'
import { StoryLink } from './story-link'
import type { WorkItemPriority, WorkItemStatus } from '@/entities/work-item'
import { WORK_ITEM_PRIORITIES } from '@/entities/work-item'
import { getInitials } from '@/shared/lib/get-initials'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

import type { StoryTableFeatures } from '../model/story-table-features'
import {
  getStoryStatusLabel,
  getStoryStatusStyle,
} from '../model/story-presentation'

const columnHelper = createColumnHelper<StoryTableFeatures, Story>()

interface SortableHeaderProps<TValue> {
  readonly label: string
  readonly column: Column<StoryTableFeatures, Story, TValue>
}

function SortableHeader<TValue>({
  label,
  column,
}: SortableHeaderProps<TValue>) {
  const sorted = column.getIsSorted()
  const nextOrder = column.getNextSortingOrder()

  const sortLabel =
    nextOrder === 'asc'
      ? `Sort ${label} ascending`
      : nextOrder === 'desc'
        ? `Sort ${label} descending`
        : `Clear ${label} sorting`

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 gap-1.5 px-2"
      onClick={column.getToggleSortingHandler()}
      aria-label={sortLabel}
    >
      <span>{label}</span>
      {sorted === 'asc' ? (
        <ArrowUp aria-hidden="true" className="size-3.5" />
      ) : sorted === 'desc' ? (
        <ArrowDown aria-hidden="true" className="size-3.5" />
      ) : (
        <ChevronsUpDown aria-hidden="true" className="size-3.5" />
      )}
    </Button>
  )
}

function PriorityContent({
  priority,
}: {
  readonly priority: WorkItemPriority | null
}) {
  if (!priority) {
    return (
      <Badge
        variant="outline"
        aria-label="Priority: No priority"
        className="whitespace-nowrap font-normal text-muted-foreground"
      >
        No priority
      </Badge>
    )
  }

  const config: Record<
    WorkItemPriority,
    {
      readonly label: string
      readonly className: string
      readonly icon: typeof ArrowRight
    }
  > = {
    [WORK_ITEM_PRIORITIES.URGENT]: {
      label: 'Urgent',
      className: 'text-rose-600',
      icon: ChevronsUp,
    },
    [WORK_ITEM_PRIORITIES.HIGH]: {
      label: 'High',
      className: 'text-orange-600',
      icon: ArrowUp,
    },
    [WORK_ITEM_PRIORITIES.MEDIUM]: {
      label: 'Medium',
      className: 'text-amber-600',
      icon: ArrowRight,
    },
    [WORK_ITEM_PRIORITIES.LOW]: {
      label: 'Low',
      className: 'text-sky-600',
      icon: ArrowDown,
    },
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

export const createStoryColumns = () =>
  columnHelper.columns([
    columnHelper.accessor('title', {
      id: 'title',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Story" column={column} />,
      cell: ({ row }) => {
        const story = row.original

        return (
          <div className="flex min-w-0 items-center gap-3 py-0.5">
            <Avatar aria-hidden="true" className="size-8 shrink-0">
              <AvatarFallback className="text-xs font-medium">
                {getInitials(story.title) ?? 'ST'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <StoryLink storyKey={story.key} title={story.title} />
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('status', {
      id: 'status',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Status" column={column} />,
      cell: ({ getValue }) => {
        const status = getValue<WorkItemStatus>()
        const label = getStoryStatusLabel(status)
        const styles = getStoryStatusStyle(status)

        return (
          <Badge
            variant="secondary"
            aria-label={`Status: ${label}`}
            className={`whitespace-nowrap font-normal ${styles.badge}`}
          >
            {label}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('priority', {
      id: 'priority',
      enableSorting: true,
      header: ({ column }) => (
        <SortableHeader label="Priority" column={column} />
      ),
      cell: ({ getValue }) => (
        <PriorityContent priority={getValue<WorkItemPriority | null>()} />
      ),
    }),
    columnHelper.accessor((story) => story.assignee?.name ?? 'Unassigned', {
      id: 'assignee',
      enableSorting: false,
      header: 'Assignee',
      cell: ({ row }) => {
        const assignee = row.original.assignee

        if (!assignee) {
          return (
            <div className="flex min-w-0 items-center text-muted-foreground">
              <span className="text-sm">Unassigned</span>
            </div>
          )
        }

        return (
          <div className="flex min-w-32 items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage
                src={assignee.avatarUrl ?? undefined}
                alt={assignee.name}
              />
              <AvatarFallback className="text-[10px]">
                {getInitials(assignee.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{assignee.name}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor('storyPoints', {
      id: 'storyPoints',
      enableSorting: true,
      header: ({ column }) => <SortableHeader label="Points" column={column} />,
      cell: ({ getValue }) => {
        const points = getValue<number | null>()

        return (
          <span className="tabular-nums text-sm text-muted-foreground">
            {points ?? '—'}
          </span>
        )
      },
    }),
    columnHelper.accessor((story) => story.sprint?.name ?? 'Backlog', {
      id: 'sprint',
      enableSorting: false,
      header: 'Sprint',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.original.sprint?.name ?? 'No sprint'}
        </span>
      ),
    }),
  ])
