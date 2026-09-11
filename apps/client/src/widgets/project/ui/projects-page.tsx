// src/widgets/project/ui/projects-page.tsx
'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  CalendarDays,
  EllipsisVertical,
  FolderKanban,
  Layers3,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { CreateProjectDialog } from '@/features/create-project/ui/create-project-dialog'
import { useWorkspaceProjects } from '@/entities/project/model/project.queries'
import {
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  type GetWorkspaceProjectsParams,
  type Project,
  type ProjectPriority,
  type ProjectStatus,
  type ProjectType,
} from '@/entities/project/model/types'
import { useWorkspace } from '@/entities/workspace'

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useMemo(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getStatusClass(status: ProjectStatus) {
  switch (status) {
    case 'active':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'planned':
      return 'border-zinc-200 bg-zinc-100 text-zinc-700'
    case 'on_hold':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'cancelled':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-zinc-200 bg-zinc-100 text-zinc-700'
  }
}

function getPriorityClass(priority: ProjectPriority) {
  switch (priority) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'high':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'medium':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'low':
      return 'border-zinc-200 bg-zinc-100 text-zinc-700'
    default:
      return 'border-zinc-200 bg-zinc-100 text-zinc-700'
  }
}

function ProjectRow({ project }: { project: Project }) {
  const resourceCount = project.resources?.length ?? 0

  return (
    <Card className="rounded-2xl border shadow-sm transition-colors hover:bg-muted/20">
      <div className="flex flex-col gap-4 p-4 lg:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-muted text-sm font-semibold">
              {project.avatarUrl ? (
                // keep it simple; you can replace this with next/image if avatars are used
                <span className="text-xs font-medium">IMG</span>
              ) : (
                <span>{getInitials(project.name)}</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold tracking-tight">
                  {project.name}
                </h3>
                <Badge variant="outline" className="rounded-full font-medium">
                  {project.key}
                </Badge>
              </div>

              {project.description ? (
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                  {project.description}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`rounded-full ${getStatusClass(project.status)}`}
                >
                  {PROJECT_STATUS_OPTIONS.find(
                    (item) => item.value === project.status
                  )?.label ?? project.status}
                </Badge>

                <Badge
                  variant="outline"
                  className={`rounded-full ${getPriorityClass(project.priority)}`}
                >
                  {PROJECT_PRIORITY_OPTIONS.find(
                    (item) => item.value === project.priority
                  )?.label ?? project.priority}
                </Badge>

                {project.type ? (
                  <Badge variant="secondary" className="rounded-full">
                    {PROJECT_TYPE_OPTIONS.find(
                      (item) => item.value === project.type
                    )?.label ?? project.type}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>View details</DropdownMenuItem>
              <DropdownMenuItem disabled>Edit project</DropdownMenuItem>
              <DropdownMenuItem disabled>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-background p-3">
            <p className="text-xs text-muted-foreground">Progress</p>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={project.progress} className="h-2 flex-1" />
              <span className="text-sm font-medium tabular-nums">
                {project.progress}%
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-background p-3">
            <p className="text-xs text-muted-foreground">Start date</p>
            <p className="mt-1 text-sm font-medium">
              {formatDate(project.startDate)}
            </p>
          </div>

          <div className="rounded-xl border bg-background p-3">
            <p className="text-xs text-muted-foreground">Target end</p>
            <p className="mt-1 text-sm font-medium">
              {formatDate(project.targetEndDate)}
            </p>
          </div>

          <div className="rounded-xl border bg-background p-3">
            <p className="text-xs text-muted-foreground">Resources</p>
            <p className="mt-1 text-sm font-medium">
              {resourceCount} linked item(s)
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Lead: {project.leadId ?? 'Unassigned'}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Created {formatDate(project.createdAt)}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <ArrowLeftRight className="h-4 w-4" />
            Updated {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>
    </Card>
  )
}

function ProjectRowSkeleton() {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <div className="flex flex-col gap-4 p-4 lg:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-96 max-w-[70vw]" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>

        <Skeleton className="h-px w-full" />
        <Skeleton className="h-4 w-80" />
      </div>
    </Card>
  )
}

export function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all')
  const [priority, setPriority] = useState<ProjectPriority | 'all'>('all')
  const [type, setType] = useState<ProjectType | 'all'>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { id: workspaceId } = useWorkspace()!

  const queryParams: GetWorkspaceProjectsParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status,
      priority,
      type,
      limit: 50,
    }),
    [debouncedSearch, status, priority, type]
  )

  const { data, isLoading, isError, refetch, isFetching } =
    useWorkspaceProjects(workspaceId, queryParams)

  const projects = useMemo(() => {
    return [...(data?.projects ?? [])].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [data?.projects])

  const total = projects.length

  return (
    <div className="space-y-6 p-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5" />
            Projects
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Project board
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Create, search, and manage workspace projects in a Linear-style
              layout.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border bg-background px-4 py-3">
            <p className="text-lg text-muted-foreground">Projects</p>
            <p className="text-lg font-semibold">{total}</p>
          </div>

          <Button onClick={() => setIsCreateOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Create project
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border shadow-sm">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as ProjectStatus | 'all')
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as ProjectPriority | 'all')
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PROJECT_PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={type}
              onValueChange={(value) => setType(value as ProjectType | 'all')}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {PROJECT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <ProjectRowSkeleton />
            <ProjectRowSkeleton />
            <ProjectRowSkeleton />
          </>
        ) : isError ? (
          <Card className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium">Failed to load projects</h3>
                <p className="text-sm text-muted-foreground">
                  Something went wrong while fetching the project list.
                </p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </Card>
        ) : projects.length ? (
          <>
            {isFetching ? (
              <p className="text-sm text-muted-foreground">
                Refreshing projects...
              </p>
            ) : null}
            {projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </>
        ) : (
          <Card className="rounded-2xl border bg-muted/20 p-10 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-background">
                <Layers3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by creating your first project. Use search and filters
                later to narrow it down.
              </p>
              <Button className="mt-5" onClick={() => setIsCreateOpen(true)}>
                Create project
              </Button>
            </div>
          </Card>
        )}
      </div>

      <CreateProjectDialog
        workspaceId={workspaceId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
