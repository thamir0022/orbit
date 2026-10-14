'use client'

import { useQuery } from '@tanstack/react-query'

import { getTeams } from '../api/get-teams.api'
import { teamKeys } from '../model/team.query-keys'

/**
 * Retrieves the teams available in the active workspace.
 *
 * Used by workspace navigation and team selectors.
 */
export function useTeamsQuery() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: getTeams,
  })
}
