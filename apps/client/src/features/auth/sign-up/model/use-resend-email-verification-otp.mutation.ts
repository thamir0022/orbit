import { useMutation } from '@tanstack/react-query'
import { resendEmailVerificationOtpApi } from '../api/resend-email-verification-otp.api'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'

export const useResendEmailVerificationOtpMutation = () => {
  return useMutation({
    mutationFn: resendEmailVerificationOtpApi,
    onSuccess: (res) => {
      if (res.success) toast.success(res.message)
    },
    onError: (error: unknown) => {
      const msg = isAxiosError(error)
        ? error.response?.data.message
        : 'Failed to resend otp, try again'
      toast.error(msg)
    },
  })
}
