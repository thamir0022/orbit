import { useWorkspaceActions } from '@/entities/workspace'
import { createWorkspaceApi } from '@/entities/workspace/api/create-workspace.api'
import { ApiResponse } from '@/shared/api/api.types'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const useCreateNewWorkspaceMutation = () => {
  const router = useRouter()
  const { workspace, clearWorkspace } = useWorkspaceActions()

  return useMutation({
    mutationFn: createWorkspaceApi,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        if (workspace) clearWorkspace()
        router.replace(`/${res.data.workspace.slug}/overview`)
      }
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to create workspace.'
      toast.error(errorMsg)
    },
  })
}
