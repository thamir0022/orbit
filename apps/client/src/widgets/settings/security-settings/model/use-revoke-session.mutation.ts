import { revokeSessionApi } from '@/entities/session/api/revoke-session.api'
import { sessionKeys } from '@/entities/session/model/session.keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useRevokeSessionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (publicId: string) => revokeSessionApi(publicId),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.active(),
      })

      toast.success(res.message)
    },
  })
}
