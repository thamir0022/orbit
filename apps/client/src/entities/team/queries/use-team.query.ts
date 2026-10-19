'use client'

import { useQuery } from '@tanstack/react-query'

import { teamKeys } from '../model/team.query-keys'
import { getTeam } from '../api/get-team.api'

/**
 * Retrieves a single team by key.
 *
 * Used by the team overview page.
 */
export function useTeamQuery(key: string) {
  return useQuery({
    queryKey: teamKeys.detail(key),
    queryFn: () => getTeam(key),
    enabled: Boolean(key),
  })
}
