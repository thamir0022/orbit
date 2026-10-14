'use client'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

import { useTeamQuery } from '@/entities/team/queries/use-team.query'

import { UpdateTeamForm } from '@/features/update-team'

import { TeamOverviewSkeleton } from './team-overview-skeleton'

interface TeamOverviewPageProps {
  readonly teamId: string
}

export function TeamOverviewPage({ teamId }: TeamOverviewPageProps) {
  const { data: team, isPending, isError, refetch } = useTeamQuery(teamId)

  if (isPending) {
    return <TeamOverviewSkeleton />
  }

  if (isError || !team) {
    return (
      <div className="flex min-h-64 w-full flex-1 items-center justify-center px-6">
        <Alert className="max-w-lg">
          <AlertTitle>Team could not be loaded</AlertTitle>

          <AlertDescription className="flex items-center justify-between gap-4">
            <span>Something went wrong while loading this team.</span>

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

  return <UpdateTeamForm team={team} />
}
