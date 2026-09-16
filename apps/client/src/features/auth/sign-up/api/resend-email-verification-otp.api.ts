import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'

interface ResendEmailVerificationOtpPayload {
  email: string
}

export const resendEmailVerificationOtpApi = async (
  payload: ResendEmailVerificationOtpPayload
) => {
  return await httpClient.post(API_ROUTES.AUTH.SIGN_UP_OTP_RESEND, payload)
}
