'use client'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

import { useTeamQuery } from '@/entities/team/queries/use-team.query'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import { TeamDetailHeader } from '@/widgets/team-detail/ui/team-detail-header'

import { UpdateTeamForm } from '@/features/update-team'

import { TeamOverviewSkeleton } from './team-overview-skeleton'

interface TeamOverviewPageProps {
  readonly teamKey: string
}

export function TeamOverviewPage({ teamKey }: TeamOverviewPageProps) {
  const { data: team, isPending, isError, refetch } = useTeamQuery(teamKey)
  const workspace = useWorkspace()

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

  return (
    <main className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <TeamDetailHeader
        team={team}
        workspaceSlug={workspace?.slug ?? ''}
        activeTab="overview"
      />
      <section aria-label="Team overview" className="min-h-0 flex-1">
        <UpdateTeamForm team={team} />
      </section>
    </main>
  )
}
