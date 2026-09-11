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
import { SlidingNumber } from '@/shared/ui/sliding-number'
import type { ResetPasswordData } from '../model/reset-password.schema'
import { useCountdown } from '@/shared/lib/hooks/use-countdown'

interface StepOtpProps {
  control: Control<ResetPasswordData>
  email: string
  isSubmitting: boolean
  onNext: () => void
  onBack: () => void
  onResend: () => void
}

export function StepOtp({
  control,
  email,
  isSubmitting,
  onNext,
  onBack,
  onResend,
}: StepOtpProps) {
  const { timeLeft, resetTimer } = useCountdown(60)

  const handleResend = () => {
    onResend()
    resetTimer()
  }

  return (
    <div className="space-y-2 w-full">
      <h2 className="text-xl text-center font-semibold">Verify OTP</h2>
      <p className="flex flex-wrap gap-1 justify-center text-sm text-muted-foreground">
        An OTP has been sent to <span className="font-medium">{email}</span>
        <button type="button" onClick={onBack} className="link text-sm">
          Change email?
        </button>
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
        isLoading={isSubmitting}
        className="w-full py-6"
      >
        Verify OTP
      </Button>

      <div className="text-center text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
        Didn&apos;t receive an OTP?{' '}
        {timeLeft > 0 ? (
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
            disabled={isSubmitting}
          >
            Resend here!
          </button>
        )}
      </div>
    </div>
  )
}
