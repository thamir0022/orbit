import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateProfile,
  type UpdateProfilePayload,
} from '@/entities/user/api/update-profile'
import { userKeys } from '@/entities/user/model/user.keys'
import { User } from '@/entities/user/model/user.types'

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(userKeys.me(), updatedUser)
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
