import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

import { Badge } from '@/shared/ui/badge'

import { Card, CardContent } from '@/shared/ui/card'

import { cn } from '@/shared/lib/utils'

import {
  formatEnumLabel,
  formatProjectDate,
  getInitials,
} from '@/entities/project/lib/project.utils'

import {
  ProjectStatus,
  type Project,
} from '@/entities/project/model/project.types'

interface ProjectBoardProps {
  readonly projects: readonly Project[]
  readonly workspaceSlug: string
}

const STATUS_COLUMNS = [
  ProjectStatus.ACTIVE,
  ProjectStatus.PAUSED,
  ProjectStatus.COMPLETED,
  ProjectStatus.CANCELED,
  ProjectStatus.ARCHIVED,
] as const

const STATUS_STYLES: Record<
  ProjectStatus,
  {
    readonly column: string
    readonly indicator: string
  }
> = {
  [ProjectStatus.ACTIVE]: {
    column: 'bg-emerald-500/5',
    indicator: 'bg-emerald-500/60',
  },

  [ProjectStatus.PAUSED]: {
    column: 'bg-amber-500/5',
    indicator: 'bg-amber-500/60',
  },

  [ProjectStatus.COMPLETED]: {
    column: 'bg-sky-500/5',
    indicator: 'bg-sky-500/60',
  },

  [ProjectStatus.CANCELED]: {
    column: 'bg-rose-500/5',
    indicator: 'bg-rose-500/60',
  },

  [ProjectStatus.ARCHIVED]: {
    column: 'bg-muted/30',
    indicator: 'bg-foreground/30',
  },
}

const groupProjectsByStatus = (
  projects: readonly Project[]
): Map<ProjectStatus, Project[]> => {
  const grouped = new Map<ProjectStatus, Project[]>()

  for (const project of projects) {
    const current = grouped.get(project.status) ?? []

    current.push(project)

    grouped.set(project.status, current)
  }

  return grouped
}

export const ProjectBoard = ({
  projects,
  workspaceSlug,
}: ProjectBoardProps) => {
  const projectsByStatus = groupProjectsByStatus(projects)

  return (
    <div className="p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STATUS_COLUMNS.map((status) => {
          const statusProjects = projectsByStatus.get(status) ?? []

          const styles = STATUS_STYLES[status]

          return (
            <section
              key={status}
              aria-labelledby={`project-status-${status}`}
              className={cn('min-w-0 rounded-xl p-2', styles.column)}
            >
              {/* Status header */}
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      styles.indicator
                    )}
                  />

                  <h2
                    id={`project-status-${status}`}
                    className="truncate text-sm font-medium"
                  >
                    {formatEnumLabel(status)}
                  </h2>

                  <Badge
                    variant="secondary"
                    className="min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                  >
                    {statusProjects.length}
                  </Badge>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {statusProjects.length === 0 ? (
                  <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed">
                    <span className="text-xs">No projects</span>
                  </div>
                ) : (
                  statusProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/${workspaceSlug}/projects/${project.key}/overview`}
                      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Card className="gap-0 py-0 transition-colors hover:border-foreground/20">
                        <CardContent className="p-3.5">
                          {/* Project identity */}
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-8 shrink-0 rounded-md">
                              <AvatarFallback className="rounded-md text-xs font-medium">
                                {getInitials(project.name)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-sm font-medium leading-5">
                                {project.name}
                              </h3>
                            </div>
                          </div>

                          {/* Project metadata */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal"
                            >
                              {formatEnumLabel(project.stage)}
                            </Badge>

                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal"
                            >
                              {formatEnumLabel(project.priority)}
                            </Badge>
                          </div>

                          {/* Project lead */}
                          <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <Avatar className="size-5 shrink-0">
                                <AvatarImage
                                  src={project.lead?.avatarUrl ?? undefined}
                                  alt={
                                    project.lead?.displayName ?? 'Unassigned'
                                  }
                                />

                                <AvatarFallback className="text-[9px]">
                                  {getInitials(project.lead?.displayName)}
                                </AvatarFallback>
                              </Avatar>

                              <span className="min-w-0 truncate text-xs">
                                {project.lead?.displayName ?? 'Unassigned'}
                              </span>
                            </div>

                            <span className="shrink-0 text-[11px]">
                              {formatProjectDate(project.targetEndDate, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
