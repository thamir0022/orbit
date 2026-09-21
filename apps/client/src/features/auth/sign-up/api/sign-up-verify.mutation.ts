import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'

interface VerifyOtpPayload {
  email: string
  code: string
}

interface VerifyOtpResponse {
  registrationToken: string
}

async function signUpVerifyApi(data: VerifyOtpPayload) {
  const res = await httpClient.post<VerifyOtpResponse>(
    API_ROUTES.AUTH.SIGN_UP_VERIFY,
    data
  )
  return res
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
  })
}
