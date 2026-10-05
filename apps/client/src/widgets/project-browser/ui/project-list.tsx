'use client'

import { useMemo } from 'react'

import type { OnChangeFn, SortingState } from '@tanstack/react-table'

import { FolderKanban } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import type { Project } from '@/entities/project/model/project.types'

import type {
  ProjectSortField,
  ProjectSortOrder,
} from '@/features/project-filters/model/project-filter.types'

import { createProjectColumns } from './project-columns'

import { ProjectDataTable } from './project-data-table'

interface ProjectListProps {
  readonly projects: readonly Project[]
  readonly workspaceSlug: string

  readonly sortField?: ProjectSortField
  readonly sortOrder?: ProjectSortOrder

  readonly onSortingChange: OnChangeFn<SortingState>
}

export const ProjectList = ({
  projects,
  workspaceSlug,
  sortField,
  sortOrder,
  onSortingChange,
}: ProjectListProps) => {
  const columns = useMemo(
    () =>
      createProjectColumns({
        workspaceSlug,
      }),
    [workspaceSlug]
  )

  const sorting = useMemo<SortingState>(() => {
    if (!sortField) {
      return []
    }

    return [
      {
        id: sortField,
        desc: sortOrder === 'desc',
      },
    ]
  }, [sortField, sortOrder])

  if (!projects.length) {
    return (
      <div className="p-6">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderKanban />
            </EmptyMedia>

            <EmptyTitle>No projects found</EmptyTitle>

            <EmptyDescription>
              Try changing your search or filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <ProjectDataTable
      columns={columns}
      data={projects}
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  )
}
