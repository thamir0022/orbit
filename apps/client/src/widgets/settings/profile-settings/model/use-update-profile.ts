import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateProfile,
  type UpdateProfilePayload,
} from '@/entities/user/api/update-profile'
import { userKeys } from '@/entities/user/model/user.keys'
import { User } from '@/entities/user/model/user.types'
import { useUserActions } from '@/entities/user/model/user.store'
import { toast } from 'sonner'

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()
  const { setUser } = useUserActions()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (res) => {
      const {
        data: { user },
        message,
      } = res

      queryClient.setQueryData(userKeys.me(), user)
      setUser(user)
      toast(message)
    },
  })
}
