'use client'

import { useCallback } from 'react'

import { Grid2X2, List, Search } from 'lucide-react'

import { useSearchParams } from 'next/navigation'

import type { OnChangeFn, SortingState } from '@tanstack/react-table'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'

import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'

import { Separator } from '@/shared/ui/separator'

import { Spinner } from '@/shared/ui/spinner'

import { cn } from '@/shared/lib/utils'

import { useProjectsQuery } from '@/entities/project/queries/use-projects.query'

import {
  ProjectPriority,
  ProjectStage,
  ProjectStatus,
  ProjectType,
} from '@/entities/project/model/project.types'

import { formatEnumLabel } from '@/entities/project/lib/project.utils'

import { useProjectFilters } from '@/features/project-filters/lib/use-project-filters'

import { ProjectFilters } from '@/features/project-filters/ui/project-filters'

import type { ProjectFilterOption } from '@/features/project-filters/model/project-filter.types'

import { isProjectSortField } from '@/features/project-filters/model/project-filter.types'

import type { ProjectViewMode } from '../model/project-view.types'

import { ProjectBoard } from './project-board'

import { ProjectList } from './project-list'

import { ProjectPagination } from './project-pagination'

import { ProjectSkeleton } from './project-skeleton'

interface ProjectBrowserProps {
  readonly workspaceSlug: string
}

const buildOptions = <T extends string>(
  values: readonly T[]
): ProjectFilterOption<T>[] => {
  return values.map((value) => ({
    value,
    label: formatEnumLabel(value),
  }))
}

const PROJECT_TYPE_OPTIONS = buildOptions(Object.values(ProjectType))

const PROJECT_STAGE_OPTIONS = buildOptions(Object.values(ProjectStage))

const PROJECT_PRIORITY_OPTIONS = buildOptions(Object.values(ProjectPriority))

const PROJECT_STATUS_OPTIONS = buildOptions(Object.values(ProjectStatus))

const toggleValue = (values: readonly string[], value: string): string[] => {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export const ProjectBrowser = ({ workspaceSlug }: ProjectBrowserProps) => {
  const searchParams = useSearchParams()

  const { params, search, setSearch, isPending, updateParams, clearFilters } =
    useProjectFilters()

  const { data, isLoading, isFetching, isError, refetch } =
    useProjectsQuery(params)

  const view: ProjectViewMode =
    searchParams.get('view') === 'board' ? 'board' : 'list'

  const projects = data?.projects ?? []

  const pagination = data?.pagination

  const sorting: SortingState = params.sortField
    ? [
        {
          id: params.sortField,
          desc: params.sortOrder === 'desc',
        },
      ]
    : []

  const handleViewChange = (value: string) => {
    if (value !== 'list' && value !== 'board') {
      return
    }

    updateParams(
      {
        view: value,
      },
      {
        resetPage: false,
      }
    )
  }

  const handlePageChange = (page: number) => {
    updateParams(
      {
        page: String(page),
      },
      {
        resetPage: false,
      }
    )
  }

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater

      const nextSort = nextSorting[0]

      if (!nextSort) {
        updateParams({
          sortField: null,
          sortOrder: null,
        })

        return
      }

      if (!isProjectSortField(nextSort.id)) {
        return
      }

      updateParams({
        sortField: nextSort.id,
        sortOrder: nextSort.desc ? 'desc' : 'asc',
      })
    },
    [sorting, updateParams]
  )

  if (isLoading) {
    return <ProjectSkeleton />
  }

  if (isError) {
    return (
      <div className="flex min-h-64 w-full items-center justify-center">
        <Alert className="max-w-lg">
          <AlertTitle>Failed to load projects</AlertTitle>

          <AlertDescription className="flex items-center justify-between gap-4">
            <span>Something went wrong while loading your projects.</span>

            <button
              type="button"
              onClick={() => refetch()}
              className="shrink-0 font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5">
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>

          <p className="mt-1 text-sm">
            Manage and track your workspace projects.
          </p>
        </div>

        <ToggleGroup
          type="single"
          value={view}
          onValueChange={handleViewChange}
          variant="outline"
          spacing={0}
          aria-label="Project view"
          className="shrink-0"
        >
          <ToggleGroupItem
            value="list"
            aria-label="List view"
            className="size-8 cursor-pointer"
          >
            <List className="size-4" aria-hidden="true" />
          </ToggleGroupItem>

          <ToggleGroupItem
            value="board"
            aria-label="Board view"
            className="size-8 cursor-pointer"
          >
            <Grid2X2 className="size-4" aria-hidden="true" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <InputGroup className="w-full max-w-sm">
            <InputGroupAddon>
              <Search className="size-4" aria-hidden="true" />
            </InputGroupAddon>

            <InputGroupInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              aria-label="Search projects"
              autoComplete="off"
            />
          </InputGroup>

          <Separator
            orientation="vertical"
            className="hidden h-6 shrink-0 sm:block"
          />

          <ProjectFilters
            types={params.types ?? []}
            stages={params.stages ?? []}
            priorities={params.priorities ?? []}
            statuses={params.statuses ?? []}
            typeOptions={PROJECT_TYPE_OPTIONS}
            stageOptions={PROJECT_STAGE_OPTIONS}
            priorityOptions={PROJECT_PRIORITY_OPTIONS}
            statusOptions={PROJECT_STATUS_OPTIONS}
            onToggleType={(value) =>
              updateParams({
                types: toggleValue(params.types ?? [], value),
              })
            }
            onToggleStage={(value) =>
              updateParams({
                stages: toggleValue(params.stages ?? [], value),
              })
            }
            onTogglePriority={(value) =>
              updateParams({
                priorities: toggleValue(params.priorities ?? [], value),
              })
            }
            onToggleStatus={(value) =>
              updateParams({
                statuses: toggleValue(params.statuses ?? [], value),
              })
            }
            onClear={clearFilters}
          />
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center gap-2 text-xs',
            isPending && 'opacity-70'
          )}
          aria-live="polite"
        >
          {isFetching && <Spinner className="size-3.5" aria-hidden="true" />}

          <span>{pagination?.total ?? 0} projects</span>
        </div>
      </div>

      {/* Project content */}
      <div className="flex min-h-0 min-w-0 flex-1">
        <ScrollArea className="h-full w-full min-w-0 rounded-lg border">
          {view === 'board' ? (
            <ProjectBoard projects={projects} workspaceSlug={workspaceSlug} />
          ) : (
            <ProjectList
              projects={projects}
              workspaceSlug={workspaceSlug}
              sortField={params.sortField}
              sortOrder={params.sortOrder}
              onSortingChange={handleSortingChange}
            />
          )}

          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* Pagination */}
      {pagination && (
        <ProjectPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
