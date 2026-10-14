import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTeamApi, teamKeys } from '@/entities/team'

export const useCreateTeamMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...teamKeys.all, 'create'] as const,

    mutationFn: createTeamApi,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: teamKeys.all,
      })
    },
  })
}
