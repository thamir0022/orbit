'use client'

import { useQuery } from '@tanstack/react-query'

import { getTeamMembers } from '../api/get-team-members.api'
import { teamKeys } from '../model/team.query-keys'

export function useTeamMembersQuery(key: string) {
  return useQuery({
    queryKey: teamKeys.members(key),
    queryFn: () => getTeamMembers(key),
    enabled: Boolean(key),
  })
}
