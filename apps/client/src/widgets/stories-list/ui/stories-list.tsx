'use client'

import {
  AlertCircle,
  ChevronRight,
  Grid2X2,
  List,
  ListFilter,
  Search,
  Users,
  X,
} from 'lucide-react'
import { type OnChangeFn, type SortingState } from '@tanstack/react-table'
import { useDeferredValue, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  isStorySortField,
  useStoriesQuery,
  type StorySortField,
} from '@/entities/story'
import { useTeamsQuery, type TeamSummary } from '@/entities/team'
import {
  type WorkItemPriority,
  type WorkItemStatus,
} from '@/entities/work-item'
import { StoriesBoard, StoriesDataTable } from '@/features/story-list'
import {
  STORY_PRIORITY_OPTIONS,
  STORY_STATUS_OPTIONS,
} from '@/features/story-list/model/story-presentation'
import {
  STORY_VIEW_MODES,
  type StoryViewMode,
} from '@/features/story-list/model/story-view.types'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/shared/ui/combobox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { getInitials } from '@/shared/lib/get-initials'
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

import { StoriesPagination } from './stories-pagination'
import { CreateStoryDialog } from '@/features/create-story/ui/create-story-dialog'

const STORIES_PER_PAGE = 12

interface StoriesListProps {
  readonly workspaceId: string
  readonly workspaceSlug: string
  readonly teamKey: string
  readonly teamName: string
}

function StoriesSkeleton() {
  return (
    <div
      aria-label="Loading stories"
      aria-busy="true"
      className="space-y-2 rounded-lg border p-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-1 py-2">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 max-w-full" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
          <Skeleton className="hidden h-6 w-16 rounded-full md:block" />
        </div>
      ))}
      <span role="status" className="sr-only">
        Loading stories
      </span>
    </div>
  )
}

export function StoriesList({
  workspaceId,
  workspaceSlug,
  teamKey,
  teamName,
}: StoriesListProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedStatuses, setSelectedStatuses] = useState<
    readonly WorkItemStatus[]
  >([])
  const [selectedPriorities, setSelectedPriorities] = useState<
    readonly WorkItemPriority[]
  >([])
  const deferredSearch = useDeferredValue(search.trim())
  const teamsQuery = useTeamsQuery()
  const teams = teamsQuery.data ?? []
  const sort = sorting[0]
  const sortField: StorySortField | undefined =
    sort && isStorySortField(sort.id) ? sort.id : undefined

  const storiesQuery = useStoriesQuery({
    workspaceId,
    teamKey,
    page,
    limit: STORIES_PER_PAGE,
    search: deferredSearch || undefined,
    statuses: selectedStatuses,
    priorities: selectedPriorities,
    sortField,
    sortOrder: sortField ? (sort?.desc ? 'desc' : 'asc') : undefined,
  })
  const storiesResponse = storiesQuery.data
  const stories = storiesResponse?.items ?? []
  const totalStories = storiesResponse?.total ?? 0
  const pageSize = storiesResponse?.limit ?? STORIES_PER_PAGE
  const totalPages = Math.max(1, Math.ceil(totalStories / pageSize))
  const currentPage = Math.min(storiesResponse?.page ?? page, totalPages)
  const firstStoryIndex = stories.length ? (currentPage - 1) * pageSize + 1 : 0
  const lastStoryIndex = firstStoryIndex + stories.length - 1
  const view: StoryViewMode =
    searchParams.get('view') === STORY_VIEW_MODES.BOARD
      ? STORY_VIEW_MODES.BOARD
      : STORY_VIEW_MODES.LIST
  const hasFilters =
    search.trim().length > 0 ||
    selectedStatuses.length > 0 ||
    selectedPriorities.length > 0

  const clearFilters = () => {
    setSearch('')
    setSelectedStatuses([])
    setSelectedPriorities([])
    setPage(1)
  }

  const toggleStatus = (status: WorkItemStatus) => {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status]
    )
    setPage(1)
  }

  const togglePriority = (priority: WorkItemPriority) => {
    setSelectedPriorities((current) =>
      current.includes(priority)
        ? current.filter((value) => value !== priority)
        : [...current, priority]
    )
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting =
      typeof updater === 'function' ? updater(sorting) : updater
    const nextSort = nextSorting[0]

    setSorting(nextSort && isStorySortField(nextSort.id) ? [nextSort] : [])
    setPage(1)
  }

  const handleViewChange = (value: string) => {
    if (value !== STORY_VIEW_MODES.LIST && value !== STORY_VIEW_MODES.BOARD) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())

    if (value === STORY_VIEW_MODES.LIST) {
      params.delete('view')
    } else {
      params.set('view', value)
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  const handleTeamChange = (team: TeamSummary | null) => {
    if (!team || team.key === teamKey) {
      return
    }

    router.push(`/${workspaceSlug}/teams/${team.key}/stories`)
  }

  return (
    <section
      aria-labelledby="stories-heading"
      className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Combobox
            items={teams}
            value={teams.find((team) => team.key === teamKey) ?? null}
            onValueChange={handleTeamChange}
            itemToStringValue={(team) => team.name}
          >
            <ComboboxTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 max-w-full justify-start gap-2 px-2 text-muted-foreground"
                  aria-label={`Select team: ${teamName}`}
                  aria-busy={teamsQuery.isPending}
                >
                  <ComboboxValue placeholder="Select a team">
                    <span className="truncate">{teamName}</span>
                  </ComboboxValue>
                </Button>
              }
            />

            <ComboboxContent align="start" side="bottom" className="w-72">
              <div className="p-2">
                <ComboboxInput
                  placeholder="Search teams..."
                  showTrigger={false}
                  showClear
                  className="h-8"
                  autoComplete="off"
                  aria-label="Search workspace teams"
                />
              </div>
              <ComboboxEmpty>No teams found.</ComboboxEmpty>
              <ComboboxList className="max-h-60 overflow-y-auto">
                {(team) => (
                  <ComboboxItem key={team.key} value={team}>
                    <Avatar aria-hidden="true" className="size-6">
                      <AvatarImage src={team.avatarUrl} alt="" />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(team.name) ?? 'TM'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{team.name}</span>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <div className="flex items-center gap-2">
            <ChevronRight
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <h1
              id="stories-heading"
              className="text-xl font-semibold tracking-tight"
            >
              Stories
            </h1>
            {!storiesQuery.isPending && !storiesQuery.isError ? (
              <Badge
                variant="secondary"
                aria-label={`${totalStories} stories`}
                className="rounded-full px-2 tabular-nums font-normal"
              >
                {totalStories}
              </Badge>
            ) : null}
          </div>
        </div>

        <ToggleGroup
          type="single"
          value={view}
          onValueChange={handleViewChange}
          variant="outline"
          spacing={0}
          aria-label="Stories view"
          className="shrink-0 self-start"
        >
          <ToggleGroupItem
            value={STORY_VIEW_MODES.LIST}
            aria-label="List view"
            className="size-8 cursor-pointer"
          >
            <List aria-hidden="true" className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value={STORY_VIEW_MODES.BOARD}
            aria-label="Board view"
            className="size-8 cursor-pointer"
          >
            <Grid2X2 aria-hidden="true" className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="search"
          aria-label="Search and filter stories"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
        >
          <InputGroup className="w-full sm:max-w-sm">
            <InputGroupAddon>
              <Search aria-hidden="true" className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.currentTarget.value)
              }
              placeholder="Search stories..."
              aria-label="Search stories"
              autoComplete="off"
            />
            {search ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  aria-label="Clear story search"
                  onClick={() => handleSearchChange('')}
                >
                  <X aria-hidden="true" className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>

          <Separator
            orientation="vertical"
            className="my-auto hidden h-7 shrink-0 sm:block"
          />

          <ListFilter
            aria-hidden="true"
            className="hidden size-4 shrink-0 text-muted-foreground sm:block"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5"
                aria-label="Filter stories by status"
              >
                Status
                {selectedStatuses.length ? (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                  >
                    {selectedStatuses.length}
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STORY_STATUS_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedStatuses.includes(option.value)}
                  onCheckedChange={() => toggleStatus(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5"
                aria-label="Filter stories by priority"
              >
                Priority
                {selectedPriorities.length ? (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                  >
                    {selectedPriorities.length}
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STORY_PRIORITY_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedPriorities.includes(option.value)}
                  onCheckedChange={() => togglePriority(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Clear story filters"
              onClick={clearFilters}
            >
              <X aria-hidden="true" className="size-3.5" />
            </Button>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          {storiesQuery.isFetching ? (
            <span role="status" aria-live="polite" className="sr-only">
              Refreshing stories
            </span>
          ) : null}
          <CreateStoryDialog teamKey={teamKey} workspaceSlug={workspaceSlug} />
        </div>
      </div>

      {storiesQuery.isPending ? <StoriesSkeleton /> : null}

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

      {storiesQuery.isSuccess && stories.length ? (
        <>
          <div
            role="region"
            aria-label={
              view === STORY_VIEW_MODES.BOARD
                ? 'Stories board'
                : 'Stories table'
            }
            className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border"
          >
            <ScrollArea className="h-full w-full">
              {view === STORY_VIEW_MODES.BOARD ? (
                <StoriesBoard stories={stories} />
              ) : (
                <StoriesDataTable
                  stories={stories}
                  sorting={sorting}
                  onSortingChange={handleSortingChange}
                />
              )}
              {view === STORY_VIEW_MODES.BOARD ? (
                <ScrollBar orientation="horizontal" />
              ) : null}
            </ScrollArea>
          </div>

          <StoriesPagination
            page={currentPage}
            totalPages={totalPages}
            total={totalStories}
            firstStoryIndex={firstStoryIndex}
            lastStoryIndex={lastStoryIndex}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {storiesQuery.isSuccess && stories.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>
              {hasFilters ? 'No stories match your filters' : 'No stories yet'}
            </EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? 'Try changing your search or filters.'
                : 'Stories created for this team will appear here.'}
            </EmptyDescription>
          </EmptyHeader>
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </Empty>
      ) : null}
    </section>
  )
}
