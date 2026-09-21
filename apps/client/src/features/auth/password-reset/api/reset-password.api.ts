import { httpClient } from '@/shared/api/config/http-client'
import type {
  RequestResetPayload,
  VerifyOtpPayload,
  ConfirmResetPayload,
  ResetPasswordResendOtpPayload,
} from '../model/reset-password.schema'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export const resetPasswordApi = {
  requestReset: (payload: RequestResetPayload) =>
    httpClient.post<null>(API_ROUTES.AUTH.RESET_PASSWORD_REQUEST, payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    httpClient.post<{ resetToken: string }>(
      API_ROUTES.AUTH.RESET_PASSWORD_VERIFY,
      payload
    ),

  confirmReset: (payload: ConfirmResetPayload) =>
    httpClient.post<null>(API_ROUTES.AUTH.RESET_PASSWORD_CONFIRM, payload),

  resendOtp: (payload: ResetPasswordResendOtpPayload) =>
    httpClient.post<null>(API_ROUTES.AUTH.RESET_PASSWORD_RESEND, payload),
}
