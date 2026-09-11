import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from '@/entities/workspace/model/workspace.keys'
import {
  editWorkspace,
  EditWorkspacePayload,
} from '@/entities/workspace/api/edit-workspace.api'
import { Workspace } from '@/entities/workspace'

export const useEditWorkspaceMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EditWorkspacePayload) => editWorkspace(payload),
    onSuccess: (updatedWorkspace: Workspace) => {
      queryClient.setQueryData(workspaceKeys.current(), updatedWorkspace)
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}
