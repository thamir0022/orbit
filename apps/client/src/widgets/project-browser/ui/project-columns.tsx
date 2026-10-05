'use client'

import Link from 'next/link'

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronsUpDown,
  CircleDot,
} from 'lucide-react'

import { createColumnHelper, type Column } from '@tanstack/react-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

import { Badge } from '@/shared/ui/badge'

import { Button } from '@/shared/ui/button'

import {
  formatEnumLabel,
  formatProjectDate,
  getInitials,
} from '@/entities/project/lib/project.utils'

import type { Project } from '@/entities/project/model/project.types'

import type { ProjectTableFeatures } from '../model/project-table-features'

const columnHelper = createColumnHelper<ProjectTableFeatures, Project>()

interface SortableHeaderProps<TValue> {
  readonly label: string
  readonly column: Column<ProjectTableFeatures, Project, TValue>
}


const SortableHeader = <TValue,>({
  label,
  column,
}: SortableHeaderProps<TValue>) => {
  const sorted = column.getIsSorted()

  const nextOrder = column.getNextSortingOrder()

  const handleSort = column.getToggleSortingHandler()
  
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
      onClick={handleSort}
      aria-label={sortLabel}
    >
      <span>{label}</span>

      {sorted === 'asc' ? (
        <ArrowUp className="size-3.5" aria-hidden="true" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="size-3.5" aria-hidden="true" />
      ) : (
        <ChevronsUpDown className="size-3.5" aria-hidden="true" />
      )}
    </Button>
  )
}

export interface ProjectColumnOptions {
  readonly workspaceSlug: string
}

export const createProjectColumns = ({
  workspaceSlug,
}: ProjectColumnOptions) => {
  return columnHelper.columns([
    // -------------------------------------------------------------------------
    // Project
    // -------------------------------------------------------------------------
    columnHelper.accessor('name', {
      id: 'name',

      enableSorting: true,

      header: ({ column }) => (
        <SortableHeader label="Project" column={column} />
      ),

      cell: ({ row }) => {
        const project = row.original

        return (
          <Link
            href={`/${workspaceSlug}/projects/${project.key}`}
            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar className="size-8 shrink-0 rounded-md" aria-hidden="true">
              <AvatarFallback className="rounded-md text-xs font-medium">
                {getInitials(project.name)}
              </AvatarFallback>
            </Avatar>

            <span className="min-w-0 truncate font-medium">{project.name}</span>
          </Link>
        )
      },
    }),

    // -------------------------------------------------------------------------
    // Type
    // -------------------------------------------------------------------------
    columnHelper.accessor('type', {
      id: 'type',

      enableSorting: true,

      header: ({ column }) => <SortableHeader label="Type" column={column} />,

      cell: ({ getValue }) => (
        <Badge variant="outline" className="whitespace-nowrap font-normal">
          {formatEnumLabel(getValue())}
        </Badge>
      ),
    }),

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    columnHelper.accessor('status', {
      id: 'status',

      enableSorting: true,

      header: ({ column }) => <SortableHeader label="Status" column={column} />,

      cell: ({ getValue }) => (
        <Badge
          variant="secondary"
          className="gap-1.5 whitespace-nowrap font-normal"
        >
          <CircleDot className="size-3" aria-hidden="true" />

          {formatEnumLabel(getValue())}
        </Badge>
      ),
    }),

    // -------------------------------------------------------------------------
    // Stage
    // -------------------------------------------------------------------------
    columnHelper.accessor('stage', {
      id: 'stage',

      enableSorting: true,

      header: ({ column }) => <SortableHeader label="Stage" column={column} />,

      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{formatEnumLabel(getValue())}</span>
      ),
    }),

    // -------------------------------------------------------------------------
    // Priority
    // -------------------------------------------------------------------------
    columnHelper.accessor('priority', {
      id: 'priority',

      enableSorting: true,

      header: ({ column }) => (
        <SortableHeader label="Priority" column={column} />
      ),

      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{formatEnumLabel(getValue())}</span>
      ),
    }),

    // -------------------------------------------------------------------------
    // Lead
    // -------------------------------------------------------------------------
    columnHelper.accessor((project) => project.lead?.displayName ?? null, {
      id: 'lead',

      enableSorting: false,

      header: 'Lead',

      cell: ({ row }) => {
        const lead = row.original.lead

        return (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="size-6 shrink-0">
              <AvatarImage
                src={lead?.avatarUrl ?? undefined}
                alt={lead?.displayName ?? 'Unassigned'}
              />

              <AvatarFallback className="text-[10px]">
                {getInitials(lead?.displayName)}
              </AvatarFallback>
            </Avatar>

            <span className="min-w-0 truncate">
              {lead?.displayName ?? 'Unassigned'}
            </span>
          </div>
        )
      },
    }),

    // -------------------------------------------------------------------------
    // Start date
    // -------------------------------------------------------------------------
    columnHelper.accessor('startDate', {
      id: 'startDate',

      enableSorting: true,

      header: ({ column }) => (
        <SortableHeader label="Start date" column={column} />
      ),

      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />

          {formatProjectDate(getValue())}
        </div>
      ),
    }),

    // -------------------------------------------------------------------------
    // Target date
    // -------------------------------------------------------------------------
    columnHelper.accessor('targetEndDate', {
      id: 'targetEndDate',

      enableSorting: true,

      header: ({ column }) => (
        <SortableHeader label="Target date" column={column} />
      ),

      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />

          {formatProjectDate(getValue())}
        </div>
      ),
    }),
  ])
}
