'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

import { StoriesList } from '@/widgets/stories-list'
import { useTeamRoute } from '@/widgets/team-route'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

function TeamStoriesPageSkeleton() {
  return (
    <main
      aria-label="Loading team stories"
      aria-busy="true"
      className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="space-y-2 rounded-lg border p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
      <span role="status" className="sr-only">
        Loading team and stories…
      </span>
    </main>
  )
}

export function StoriesPage() {
  const {
    workspaceId,
    workspaceSlug,
    teamKey,
    team,
    isWorkspacePending,
    isWorkspaceMismatch,
    isTeamPending,
    isTeamError,
    teamError,
    retryTeam,
  } = useTeamRoute()

  if (isWorkspacePending || isTeamPending) {
    return <TeamStoriesPageSkeleton />
  }

  if (isWorkspaceMismatch) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <Alert variant="destructive" role="alert">
          <AlertCircle aria-hidden="true" className="size-4" />
          <AlertTitle>Workspace context mismatch</AlertTitle>
          <AlertDescription>
            This route belongs to workspace “{workspaceSlug}”, but a different
            workspace is active. Switch to the correct workspace and try again.
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  if (isTeamError || !team || !workspaceId) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <Alert variant="destructive" role="alert">
          <AlertCircle aria-hidden="true" className="size-4" />
          <AlertTitle>Unable to load this team</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {teamError?.message ??
                `Team “${teamKey}” was not found or is no longer accessible.`}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void retryTeam()}
            >
              <RefreshCw aria-hidden="true" className="mr-2 size-3.5" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <StoriesList
      workspaceId={workspaceId}
      teamKey={team.key}
      teamName={team.name}
    />
  )
}
