import { selectWorkspaceApi } from '@/entities/workspace/api/select-workspace.api'
import { useWorkspaceActions } from '@/entities/workspace/model/workspace.store'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

export const useSelectWorkspaceMutation = () => {
  const { workspace, setWorkspace } = useWorkspaceActions()

  return useMutation({
    mutationFn: selectWorkspaceApi,

    onSuccess: (response) => {
      if (!response.success || !response.data?.workspace) {
        toast.error('Failed to select workspace.')
        return
      }

      setWorkspace(response.data.workspace)

      const msg = workspace
        ? `Switched to ${response.data.workspace.name}`
        : `Welcome to ${response.data.workspace.name}`
      toast.success(msg)
    },
  })
}
