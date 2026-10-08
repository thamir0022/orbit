'use client'

import { useQuery } from '@tanstack/react-query'

import { getTeams } from './get-teams.api'
import { teamQueryKeys } from '../model/team.query-keys'

/**
 * Retrieves the teams available in the active workspace.
 *
 * Used by workspace navigation and team selectors.
 */
export function useTeamsQuery() {
  return useQuery({
    queryKey: teamQueryKeys.lists(),
    queryFn: getTeams,
  })
}
