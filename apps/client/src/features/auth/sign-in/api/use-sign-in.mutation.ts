import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { signInApi } from './sign-in.api'
import type { SignInFormData } from '../model/sign-in.schema'
import type { ApiResponse } from '@/shared/api/api.types'

export function useSignInMutation() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: SignInFormData) => signInApi(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Successfully signed in!')
        // Alternatively, pass an onSuccess callback to the hook
        // if you want the parent page to dictate the redirect route.
        router.push('/')
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
