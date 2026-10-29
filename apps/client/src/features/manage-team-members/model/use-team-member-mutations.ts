'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamKeys } from '@/entities/team/model/team.query-keys'
import { addTeamMembers, removeTeamMember } from '../api/team-members.api'

/** Refreshes team members after successful membership changes. */
export function useTeamMemberMutations(teamKey: string) {
  const client = useQueryClient()
  const refresh = () =>
    client.invalidateQueries({ queryKey: teamKeys.members(teamKey) })
  const add = useMutation({
    mutationFn: (ids: string[]) => addTeamMembers(teamKey, ids),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (id: string) => removeTeamMember(teamKey, id),
    onSuccess: refresh,
  })
  return { add, remove }
}
