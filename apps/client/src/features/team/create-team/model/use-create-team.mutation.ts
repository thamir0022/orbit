import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTeamApi, teamQueryKeys } from '@/entities/team'

export const useCreateTeamMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...teamQueryKeys.all, 'create'] as const,

    mutationFn: createTeamApi,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: teamQueryKeys.all,
      })
    },
  })
}
