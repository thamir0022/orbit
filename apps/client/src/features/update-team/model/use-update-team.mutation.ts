'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Team, TeamStatus } from '@/entities/team'

import { updateTeam } from '../api/update-team.api'

import { teamKeys } from '@/entities/team'

export interface UpdateTeamMutationInput {
  readonly teamId: string
  readonly name?: string
  readonly description?: string
  readonly status?: TeamStatus
  readonly leadId?: string
}

export function useUpdateTeamMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      name,
      description,
      status,
      leadId,
    }: UpdateTeamMutationInput) =>
      updateTeam(teamId, {
        name,
        description,
        status,
        leadId,
      }),

    onSuccess: (updatedTeam: Team, { teamId }) => {
      queryClient.setQueryData(teamKeys.detail(teamId), updatedTeam)

      void queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      })
    },
  })
}
