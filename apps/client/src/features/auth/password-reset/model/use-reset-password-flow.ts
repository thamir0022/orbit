'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  resetPasswordSchema,
  type ResetPasswordData,
} from './reset-password.schema'
import {
  useRequestResetMutation,
  useVerifyOtpMutation,
  useConfirmResetMutation,
  useResendOtpMutation,
} from '../api/reset-password.mutations'

type Step = 'email' | 'otp' | 'password'

export function useResetPasswordFlow() {
  const router = useRouter()

  // Local UI State
  const [step, setStep] = React.useState<Step>('email')
  const [direction, setDirection] = React.useState(0)
  const [resetToken, setResetToken] = React.useState<string | null>(null)

  // Mutations
  const { mutateAsync: requestReset, isPending: isRequesting } =
    useRequestResetMutation()
  const { mutateAsync: verifyOtp, isPending: isVerifying } =
    useVerifyOtpMutation()
  const { mutateAsync: confirmReset, isPending: isConfirming } =
    useConfirmResetMutation()
  const { mutateAsync: triggerResend, isPending: isResending } =
    useResendOtpMutation()

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '', otp: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  })

  // --- Step Actions ---

  const submitEmail = async () => {
    const isValid = await form.trigger('email')
    if (!isValid) return

    const email = form.getValues('email')

    // Using mutateAsync to await the success response before transitioning
    await requestReset(
      { email },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'OTP sent to your email')
          setDirection(1)
          setStep('otp')
        },
        onError: () => {
          setDirection(1)
          setStep('otp')
        },
      }
    )
  }

  const resendOtp = async () => {
    const email = form.getValues('email')
    if (!email) {
      toast.error('Email is missing. Please restart the process.')
      return
    }

    await triggerResend(
      { email },
      {
        onSuccess: (res) =>
          toast.success(res.message || 'A new OTP has been sent!'),
      }
    )
  }

  const submitOtp = async () => {
    const isValid = await form.trigger('otp')
    if (!isValid) return

    const { email, otp } = form.getValues()
    if (!otp) return

    await verifyOtp(
      { email, otp },
      {
        onSuccess: (res) => {
          setResetToken(res.data.resetToken)
          toast.success('OTP Verified')
          setDirection(1)
          setStep('password')
        },
      }
    )
  }

  const submitPassword = async () => {
    const isValid = await form.trigger(['password', 'confirmPassword'])
    if (!isValid) return

    const { password, confirmPassword } = form.getValues()

    if (
      !resetToken ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      toast.error('Missing required data. Please try again.')
      return
    }

    await confirmReset(
      { resetToken, newPassword: password },
      {
        onSuccess: () => {
          toast.success('Password successfully reset!')
          router.replace('/sign-in')
        },
      }
    )
  }

  const goBack = (targetStep: Step) => {
    setDirection(-1)
    setStep(targetStep)

    if (targetStep === 'email') {
      form.setValue('otp', '')
      setResetToken(null)
    }
  }

  return {
    state: {
      step,
      direction,
      isPending: isRequesting || isVerifying || isConfirming || isResending,
    },
    form,
    actions: {
      submitEmail,
      submitOtp,
      submitPassword,
      resendOtp,
      goBack,
    },
  }
}
