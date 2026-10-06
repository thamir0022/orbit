import { useMutation } from '@tanstack/react-query'

import { deleteProject } from '../api/delete-project.api'

export const useDeleteProjectMutation = () => {
  return useMutation({
    mutationFn: deleteProject,
  })
}
