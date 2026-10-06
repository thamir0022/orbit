'use client'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

import { Button } from '@/shared/ui/button'

import { ProjectOverviewSkeleton } from './project-overview-skelton'

import { useProjectQuery } from '@/entities/project/queries/use-project.query'

import { UpdateProjectForm } from '@/features/edit-project/ui/update-project-form'

export const ProjectOverviewPage = ({ projectKey }: { projectKey: string }) => {
  const {
    data: project,
    isPending,
    isError,
    refetch,
  } = useProjectQuery(projectKey)

  if (isPending) {
    return <ProjectOverviewSkeleton />
  }

  if (isError || !project) {
    return (
      <div className="flex min-h-64 w-full flex-1 items-center justify-center px-6">
        <Alert className="max-w-lg">
          <AlertTitle>Project could not be loaded</AlertTitle>

          <AlertDescription className="flex items-center justify-between gap-4">
            <span>Something went wrong while loading this project.</span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <UpdateProjectForm project={project} />
}
