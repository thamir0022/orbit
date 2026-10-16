import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resetPasswordApi } from './reset-password.api'

// Centralized error handler for the feature
const handleMutationError = (error: unknown) => {
  const msg = error instanceof Error ? error.message : 'Something went wrong'
  toast.error(msg)
}

export function useRequestResetMutation() {
  return useMutation({
    mutationFn: resetPasswordApi.requestReset,
    onError: handleMutationError,
  })
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: resetPasswordApi.verifyOtp,
    onError: handleMutationError,
  })
}

export function useConfirmResetMutation() {
  return useMutation({
    mutationFn: resetPasswordApi.confirmReset,
    onError: handleMutationError,
  })
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: resetPasswordApi.resendOtp,
    onError: handleMutationError,
  })
}
