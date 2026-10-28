'use client'

import { createContext, useContext } from 'react'

import type { Team } from '@/entities/team/model/team.types'

export interface TeamRouteContextValue {
  readonly workspaceSlug: string
  readonly workspaceId: string | undefined
  readonly teamKey: string
  readonly team: Team | undefined
  readonly isWorkspacePending: boolean
  readonly isWorkspaceMismatch: boolean
  readonly isTeamPending: boolean
  readonly isTeamFetching: boolean
  readonly isTeamError: boolean
  readonly teamError: Error | null
  readonly retryTeam: () => Promise<unknown>
}

export const TeamRouteContext = createContext<TeamRouteContextValue | null>(null)

export function useTeamRoute(): TeamRouteContextValue {
  const context = useContext(TeamRouteContext)

  if (!context) {
    throw new Error('useTeamRoute must be used within TeamRouteProvider.')
  }

  return context
}
