'use client'

import { useQuery } from '@tanstack/react-query'

import { teamKeys } from '../model/team.query-keys'
import { getTeam } from '../api/get-team.api'

/**
 * Retrieves a single team by id.
 *
 * Used by the team overview page.
 */
export function useTeamQuery(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => getTeam(id),
    enabled: Boolean(id),
  })
}
