'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useTeamQuery } from '@/entities/team'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'

import { TeamRouteContext } from '../model/team-route-context'

interface TeamRouteProviderProps {
  readonly workspaceSlug: string
  readonly teamKey: string
  readonly children: ReactNode
}

/** Resolves the URL team once in the persistent team route layout. */
export function TeamRouteProvider({
  workspaceSlug,
  teamKey,
  children,
}: TeamRouteProviderProps) {
  const workspace = useWorkspace()

  const isWorkspacePending = !workspace
  const isWorkspaceMismatch = Boolean(
    workspace && workspace.slug !== workspaceSlug
  )

  const workspaceId = isWorkspaceMismatch ? undefined : workspace?.id

  const teamQuery = useTeamQuery(teamKey)

  const value = useMemo(
    () => ({
      workspaceSlug,
      workspaceId,
      teamKey,
      team: teamQuery.data,
      isWorkspacePending,
      isWorkspaceMismatch,
      isTeamPending:
        !isWorkspaceMismatch && (!workspaceId || teamQuery.isPending),
      isTeamFetching: teamQuery.isFetching,
      isTeamError: teamQuery.isError,
      teamError: teamQuery.error,
      retryTeam: teamQuery.refetch,
    }),
    [
      workspaceSlug,
      workspaceId,
      teamKey,
      teamQuery.data,
      teamQuery.isPending,
      teamQuery.isFetching,
      teamQuery.isError,
      teamQuery.error,
      teamQuery.refetch,
      isWorkspacePending,
      isWorkspaceMismatch,
    ]
  )

  return (
    <TeamRouteContext.Provider value={value}>
      {children}
    </TeamRouteContext.Provider>
  )
}
