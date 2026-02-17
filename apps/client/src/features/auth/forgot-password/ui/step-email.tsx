import { Controller, type Control } from 'react-hook-form'
import Link from 'next/link'
import { IoIosArrowBack } from 'react-icons/io'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import type { ForgotPasswordData } from '../model/forgot-password.schema'

interface StepEmailProps {
  control: Control<ForgotPasswordData>
  isSubmitting: boolean
  onNext: () => void
}

export function StepEmail({ control, isSubmitting, onNext }: StepEmailProps) {
  return (
    <div className="space-y-3 w-full">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Forgot Password?</h2>
      </div>

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="reset-email">Email Address</FieldLabel>
            <Input
              {...field}
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              className="px-3 py-6 border-2"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="cursor-pointer w-full py-6 mt-4"
      >
        {isSubmitting ? 'Sending...' : 'Send OTP'}
      </Button>

      <Link
        href="/sign-in"
        className="flex items-center text-center justify-center mt-2"
      >
        <IoIosArrowBack className="mr-1" />
        Back to Sign In
      </Link>
    </div>
  )
}
