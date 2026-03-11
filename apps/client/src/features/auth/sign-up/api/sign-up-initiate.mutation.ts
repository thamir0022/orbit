import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { axiosInstance } from '@/shared/lib/axios'
import type { ApiResponse } from '@/shared/api/api.types'
import type { EmailStepData } from '../model/sign-up-initiate.schema'
import { API_ROUTES } from '@/shared/api/api.routes'

// Pure API function (could also be extracted to a separate file)
async function signUpInitiateApi(
  data: EmailStepData
): Promise<ApiResponse<null>> {
  const response = await axiosInstance.post(
    API_ROUTES.AUTH.SIGN_UP_INITIATE,
    data
  )
  return response.data
}

export function useSignUpMutation(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: signUpInitiateApi,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Verification code sent!')
        onSuccessCallback?.() // Trigger the step change
      }
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : 'Failed to send verification code.'

      toast.error(errorMsg)
    },
  })
}
