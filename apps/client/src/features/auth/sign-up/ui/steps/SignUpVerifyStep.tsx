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
} from '@/shared/ui/input-otp'

export function SignUpVerifyStep() {
  // 1. Pull state and actions from the global store
  const email = useSignUpStore((state) => state.email)
  const nextStep = useSignUpStore((state) => state.nextStep)
  const prevStep = useSignUpStore((state) => state.prevStep)
  const setRegistrationToken = useSignUpStore(
    (state) => state.setRegistrationToken
  )

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

  return (
    <Step>
      <div className="mb-5 text-center space-y-2">
        <h2 className="sub-heading">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit verification code to{' '}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <button
          type="button"
          onClick={prevStep}
          className="text-xs font-semibold text-primary cursor-pointer hover:underline"
        >
          Change email
        </button>
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
            disabled={isPending}
          >
            {isPending ? 'Verifying...' : 'Verify Email'}
          </Button>
        </FieldGroup>
      </form>
    </Step>
  )
}
