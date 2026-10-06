import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateProjectApi } from '@/entities/project/api/update-project.api'

import { projectKeys } from '@/entities/project/model/project.keys'

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['projects', 'update'],

    mutationFn: updateProjectApi,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      })
    },
  })
}
