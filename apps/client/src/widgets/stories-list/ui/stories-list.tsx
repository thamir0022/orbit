'use client'

import { AlertCircle, BookOpen, RefreshCw, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useStoriesQuery, type Story } from '@/entities/story'
import { WORK_ITEM_STATUSES } from '@/entities/work-item'
import type { WorkItemStatus } from '@/entities/work-item'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { StoriesDataTable } from '@/features/story-list'

interface StoriesListProps {
  readonly workspaceId: string
  readonly teamKey: string
  readonly teamName: string
}

type StoryStatusFilter = 'ALL' | WorkItemStatus

const STATUS_FILTERS: readonly {
  readonly value: StoryStatusFilter
  readonly label: string
}[] = [
  { value: 'ALL', label: 'All stories' },
  { value: WORK_ITEM_STATUSES.BACKLOG, label: 'Backlog' },
  { value: WORK_ITEM_STATUSES.TODO, label: 'To do' },
  { value: WORK_ITEM_STATUSES.IN_PROGRESS, label: 'In progress' },
  { value: WORK_ITEM_STATUSES.IN_REVIEW, label: 'In review' },
  { value: WORK_ITEM_STATUSES.DONE, label: 'Done' },
  { value: WORK_ITEM_STATUSES.CANCELLED, label: 'Cancelled' },
]

function matchesStatus(story: Story, status: StoryStatusFilter): boolean {
  return status === 'ALL' || story.status === status
}

interface StoriesEmptyStateProps {
  readonly hasFilters: boolean
  readonly onClearFilters: () => void
}

function StoriesEmptyState({
  hasFilters,
  onClearFilters,
}: StoriesEmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <BookOpen aria-hidden="true" className="size-5" />
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold">
          {hasFilters ? 'No stories match your filters' : 'No stories yet'}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {hasFilters
            ? 'Try a different search or status, or clear your filters.'
            : 'Stories created for this team will appear here.'}
        </p>
      </div>
      {hasFilters ? (
        <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}

function StoriesTableSkeleton() {
  return (
    <div aria-label="Loading stories" aria-busy="true" className="space-y-2 rounded-lg border p-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 py-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
      <span className="sr-only" role="status">Loading stories</span>
    </div>
  )
}

export function StoriesList({
  workspaceId,
  teamKey,
  teamName,
}: StoriesListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StoryStatusFilter>('ALL')

  const storiesQuery = useStoriesQuery({ workspaceId, teamKey })
  const stories = storiesQuery.data ?? []

  const visibleStories = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return stories.filter((story) => {
      if (!matchesStatus(story, statusFilter)) return false
      if (!normalizedSearch) return true

      return (
        story.key.toLocaleLowerCase().includes(normalizedSearch) ||
        story.title.toLocaleLowerCase().includes(normalizedSearch)
      )
    })
  }, [search, statusFilter, stories])

  const statusCounts = useMemo(() => {
    const counts: Record<StoryStatusFilter, number> = {
      ALL: stories.length,
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      CANCELLED: 0,
    }

    for (const story of stories) {
      counts[story.status] += 1
    }

    return counts
  }, [stories])

  const hasFilters = search.trim().length > 0 || statusFilter !== 'ALL'
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
  }

  return (
    <section aria-labelledby="stories-heading" className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">{teamName}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 id="stories-heading" className="text-2xl font-semibold tracking-tight">
              Stories
            </h1>
            {!storiesQuery.isPending && !storiesQuery.isError ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {stories.length}
              </span>
            ) : null}
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track user stories and the work your team is delivering.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {storiesQuery.isFetching ? (
            <span role="status" aria-live="polite" className="sr-only">
              Refreshing stories
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void storiesQuery.refetch()}
            disabled={storiesQuery.isFetching}
          >
            <RefreshCw
              aria-hidden="true"
              className={`mr-2 size-3.5 ${storiesQuery.isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </header>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <label htmlFor="stories-search" className="sr-only">
              Search stories by title or key
            </label>
            <Input
              id="stories-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search stories..."
              autoComplete="off"
              className="pl-9 pr-9"
            />
            {search ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                aria-label="Clear story search"
                onClick={() => setSearch('')}
              >
                <X aria-hidden="true" className="size-3.5" />
              </Button>
            ) : null}
          </div>

          <div
            role="group"
            aria-label="Filter stories by status"
            className="flex max-w-full flex-wrap items-center gap-1"
          >
            {STATUS_FILTERS.map((filter) => {
              const count =
                filter.value === 'ALL'
                  ? statusCounts.ALL
                  : statusCounts[filter.value]
              const isSelected = statusFilter === filter.value

              return (
                <Button
                  key={filter.value}
                  type="button"
                  size="sm"
                  variant={isSelected ? 'secondary' : 'ghost'}
                  aria-pressed={isSelected}
                  onClick={() => setStatusFilter(filter.value)}
                  className="h-8 gap-2 px-2.5 text-xs"
                >
                  {filter.label}
                  <span className="text-muted-foreground tabular-nums">{count}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {storiesQuery.isPending ? <StoriesTableSkeleton /> : null}

        {storiesQuery.isError ? (
          <Alert variant="destructive" role="alert">
            <AlertCircle aria-hidden="true" className="size-4" />
            <AlertTitle>Could not load stories</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {storiesQuery.error instanceof Error
                  ? storiesQuery.error.message
                  : 'An unexpected error occurred while loading stories.'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void storiesQuery.refetch()}
                disabled={storiesQuery.isFetching}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {storiesQuery.isSuccess && visibleStories.length > 0 ? (
          <>
            <StoriesDataTable stories={visibleStories} />
            <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p aria-live="polite" aria-atomic="true">
                Showing {visibleStories.length} of {stories.length} stories
              </p>
              <p>Sorted by selecting a column heading</p>
            </div>
          </>
        ) : null}

        {storiesQuery.isSuccess && visibleStories.length === 0 ? (
          <StoriesEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        ) : null}
      </div>
    </section>
  )
}
