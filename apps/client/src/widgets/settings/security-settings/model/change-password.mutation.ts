import {
  changePasswordApi,
  ChangePasswordApiPayload,
} from '@/entities/user/api/change-password.api'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordApiPayload) =>
      changePasswordApi(payload),
    onSuccess: (res) => {
      toast(res.message)
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError(error)
        ? error?.response?.data.message
        : 'Failed to change password'
      toast(errorMsg)
    },
  })
}
