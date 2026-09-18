import {
  changePasswordApi,
  ChangePasswordApiPayload,
} from '@/entities/user/api/change-password.api'
import { userKeys } from '@/entities/user/model/user.keys'
import { useUserActions } from '@/entities/user/model/user.store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

export const useChangePasswordMutation = () => {
  const queryClient = useQueryClient()
  const { setUser } = useUserActions()

  return useMutation({
    mutationFn: (payload: ChangePasswordApiPayload) =>
      changePasswordApi(payload),
    onSuccess: (res) => {
      const updatedUser = res.data.user

      queryClient.setQueryData(userKeys.me(), updatedUser)
      setUser(updatedUser)
      toast.success(res.message)
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError(error)
        ? error?.response?.data.message
        : 'Failed to change password'
      toast.error(errorMsg)
    },
  })
}
