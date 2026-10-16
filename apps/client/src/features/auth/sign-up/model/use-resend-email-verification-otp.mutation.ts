import { useMutation } from '@tanstack/react-query'
import { resendEmailVerificationOtpApi } from '../api/resend-email-verification-otp.api'
import { toast } from 'sonner'

export const useResendEmailVerificationOtpMutation = () => {
  return useMutation({
    mutationFn: resendEmailVerificationOtpApi,
    onSuccess: (res) => {
      if (res.success) toast.success(res.message)
    },
  })
}
