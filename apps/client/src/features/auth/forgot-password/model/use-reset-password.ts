import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'

import { axiosInstance } from '@/shared/lib/axios.instance'
import type { ApiResponse } from '@/shared/api/types/api.types'
import {
  forgotPasswordSchema,
  type ForgotPasswordData,
} from './forgot-password.schema'

export function useResetPassword() {
  const [step, setStep] = React.useState<'email' | 'otp' | 'password'>('email')
  const [direction, setDirection] = React.useState(0)
  const [resetToken, setResetToken] = React.useState<string | null>(null)

  const router = useRouter()

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '', otp: '', password: '' },
    mode: 'onSubmit',
  })

  // Helper to handle API errors consistently
  const handleError = (error: unknown) => {
    const errorMsg = isAxiosError<ApiResponse<null>>(error)
      ? (error.response?.data?.message ?? error.message)
      : error instanceof Error
        ? error.message
        : 'Something went wrong!'
    toast.error(errorMsg)
  }

  // --- Actions ---

  const submitEmail = async () => {
    const isValid = await form.trigger('email')
    if (!isValid) return

    try {
      const res = await axiosInstance.post<ApiResponse<null>>(
        '/auth/reset-password/request',
        {
          email: form.getValues('email'),
        }
      )
      if (res.data.success) {
        toast.success(res.data.message || 'OTP sent to your email')
        setDirection(1)
        setStep('otp')
      }
    } catch (error) {
      handleError(error)
    }
  }

  const submitOtp = async () => {
    const isValid = await form.trigger('otp')
    if (!isValid) return

    try {
      const res = await axiosInstance.post<ApiResponse<{ resetToken: string }>>(
        '/auth/reset-password/verify',
        { email: form.getValues('email'), otp: form.getValues('otp') }
      )
      if (res.data.success) {
        setResetToken(res.data.data.resetToken)
        toast.success('OTP Verified')
        setDirection(1)
        setStep('password')
      }
    } catch (error) {
      handleError(error)
    }
  }

  const submitPassword = async () => {
    const isValid = await form.trigger('password')
    if (!isValid) return

    if (!resetToken) {
      toast.error('Missing reset token. Please try again.')
      return
    }

    try {
      const res = await axiosInstance.post<ApiResponse<null>>(
        '/auth/reset-password/confirm',
        {
          resetToken,
          newPassword: form.getValues('password'),
        }
      )
      if (res.data.success) {
        toast.success('Password successfully reset!')
        router.push('/sign-in')
      }
    } catch (error) {
      handleError(error)
    }
  }

  const goBack = (targetStep: 'email' | 'otp') => {
    setDirection(-1)
    setStep(targetStep)
    if (targetStep === 'email') {
      form.resetField('email')
      form.resetField('otp')
    }
  }

  return {
    step,
    direction,
    form,
    actions: {
      submitEmail,
      submitOtp,
      submitPassword,
      goBack,
    },
  }
}
