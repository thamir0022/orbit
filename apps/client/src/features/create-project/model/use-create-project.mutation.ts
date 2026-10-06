import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createProject,
  type CreateProjectRequest,
  type CreateProjectResponse,
} from '../api/create-project.api'

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<CreateProjectResponse, Error, CreateProjectRequest>({
    mutationFn: createProject,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'projects',
      })
    },
  })
}
