import { Controller, type Control } from 'react-hook-form'
import { Button } from '@/shared/ui/button'
import { Field, FieldError } from '@/shared/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@/shared/ui/input-otp'
import type { ForgotPasswordData } from '../model/forgot-password.schema'

interface StepOtpProps {
  control: Control<ForgotPasswordData>
  email: string
  isSubmitting: boolean
  onNext: () => void
  onBack: () => void
}

export function StepOtp({
  control,
  email,
  isSubmitting,
  onNext,
  onBack,
}: StepOtpProps) {
  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl text-center font-semibold">Verify OTP</h2>
      <p className="flex items-center gap-1 justify-center text-sm text-center text-muted-foreground">
        An OTP has been sent to{' '}
        <span className="font-medium underline">{email}</span>
        <span onClick={onBack} className="link text-sm">
          Change email?
        </span>
      </p>

      <div className="flex justify-center py-4">
        <Controller
          name="otp"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={field.value}
                onChange={field.onChange}
              >
                <InputOTPGroup className="mx-auto">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSeparator />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="cursor-pointer w-full py-6"
      >
        Verify OTP
      </Button>
      <p className="text-center">Did&apos;t recieve a OTP? Resend here!</p>
    </div>
  )
}
