'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Step } from '@/shared/ui/stepper'

import { useSignUpStore } from '../../model/sign-up.store'
import {
  signUpVerifySchema,
  type OtpStepData,
} from '../../model/sign-up-verify.schema'
import { useSignUpVerifyMutation } from '../../api/sign-up-verify.mutation'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@/shared/ui/input-otp'
import { useCountdown } from '@/shared/lib/hooks/use-countdown'
import { SlidingNumber } from '@/shared/ui/sliding-number'
import { useResendEmailVerificationOtpMutation } from '../../model/use-resend-email-verification-otp.mutation'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'

export function SignUpVerifyStep() {
  // 1. Pull state and actions from the global store
  const email = useSignUpStore((state) => state.email)
  const nextStep = useSignUpStore((state) => state.nextStep)
  const prevStep = useSignUpStore((state) => state.prevStep)
  const setRegistrationToken = useSignUpStore(
    (state) => state.setRegistrationToken
  )

  const { timeLeft, resetTimer } = useCountdown(60)

  // 2. Initialize form
  const form = useForm<OtpStepData>({
    resolver: zodResolver(signUpVerifySchema),
    defaultValues: { code: '' },
  })

  // 3. Initialize API mutation, passing the success action
  const { mutate: verifyOtp, isPending } = useSignUpVerifyMutation((token) => {
    setRegistrationToken(token)
    nextStep()
  })

  // 4. Submit handler delegates to TanStack Query
  function onSubmit(data: OtpStepData) {
    if (!email) return // Safety check, though FSD routing usually guards this

    verifyOtp({ email, code: data.code })
  }

  const { mutate: resendOtp, isPending: isResendOtpPending } =
    useResendEmailVerificationOtpMutation()

  const handleResend = () => {
    if (!email) return prevStep()
    resendOtp({ email })
    resetTimer()
  }

  return (
    <Step>
      <div className="mb-5 text-center space-y-2">
        <h2 className="sub-heading">Check your email</h2>
        <p className="flex flex-wrap gap-1 justify-center text-sm text-muted-foreground">
          An OTP has been sent to <span className="font-medium">{email}</span>
          <button type="button" onClick={prevStep} className="link text-sm">
            Change email?
          </button>
        </p>
      </div>

      <form
        id="verify-otp-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="otp-code" className="sr-only">
                  Verification Code
                </FieldLabel>
                <InputOTP
                  id="otp-code"
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  containerClassName="justify-center"
                  pattern={REGEXP_ONLY_DIGITS}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            form="verify-otp-form"
            className="w-full py-6 cursor-pointer max-sm:font-bold font-medium"
            isLoading={isPending}
            disabled={isPending || isResendOtpPending}
          >
            Verify OTP
          </Button>
        </FieldGroup>

        <div className="text-center text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
          Didn&apos;t receive an OTP?{' '}
          {isResendOtpPending ? (
            <Loader className="animate-spin size-5" />
          ) : timeLeft > 0 ? (
            <span className="font-medium inline-flex items-center tabular-nums">
              {/* Replaced static text with your animated component */}
              <span className="mr-1">Resend in</span>{' '}
              <SlidingNumber value={timeLeft} padStart={true} />s
            </span>
          ) : (
            <button
              type="button"
              className="link font-medium"
              onClick={handleResend}
              disabled={isResendOtpPending}
            >
              Resend here!
            </button>
          )}
        </div>
      </form>
    </Step>
  )
}
