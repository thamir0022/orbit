import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { axiosInstance } from '@/shared/lib/axios'
import type { ApiResponse } from '@/shared/api/api.types'
import { API_ROUTES } from '@/shared/api/api.routes'

interface VerifyOtpPayload {
  email: string
  code: string
}

interface VerifyOtpResponse {
  registrationToken: string
}

async function signUpVerifyApi(
  data: VerifyOtpPayload
): Promise<ApiResponse<VerifyOtpResponse>> {
  const response = await axiosInstance.post(
    API_ROUTES.AUTH.SIGN_UP_VERIFY,
    data
  )
  return response.data
}

export function useSignUpVerifyMutation(
  onSuccessCallback?: (token: string) => void
) {
  return useMutation({
    mutationFn: signUpVerifyApi,
    onSuccess: (data) => {
      if (data.success && data.data?.registrationToken) {
        toast.success(data.message || 'Email verified successfully!')
        onSuccessCallback?.(data.data.registrationToken)
      }
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : 'Invalid verification code.'

      toast.error(errorMsg)
    },
  })
}
