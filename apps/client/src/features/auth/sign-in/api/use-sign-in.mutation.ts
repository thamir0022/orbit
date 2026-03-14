import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { signInApi } from './sign-in.api'
import type { SignInFormData } from '../model/sign-in.schema'
import type { ApiResponse } from '@/shared/api/api.types'

export function useSignInMutation() {
  return useMutation({
    mutationFn: (data: SignInFormData) => signInApi(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Successfully signed in!')
        console.log(data)
        window.location.assign(data.data.redirectUrl)
      }
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : 'Something went wrong!'

      toast.error(errorMsg)
    },
  })
}
