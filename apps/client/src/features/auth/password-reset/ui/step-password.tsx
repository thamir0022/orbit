import { Controller, type Control } from 'react-hook-form'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import type { ResetPasswordData } from '../model/reset-password.schema'
import { IoIosArrowBack } from 'react-icons/io'
import PasswordField from '@/shared/ui/PasswordField'

interface StepPasswordProps {
  control: Control<ResetPasswordData>
  isSubmitting: boolean
  onNext: () => void
  onBack: () => void
}

export function StepPassword({
  control,
  isSubmitting,
  onNext,
  onBack,
}: StepPasswordProps) {
  return (
    <div className="space-y-2 w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Create a strong new password</h2>
      </div>

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <PasswordField
              {...field}
              label="New Password"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <PasswordField
              {...field}
              label="Confirm Password"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        type="submit"
        onClick={onNext}
        isLoading={isSubmitting}
        className="w-full py-6"
      >
        Reset
      </Button>

      <div className="flex justify-center">
        <span className="w-fit link flex items-center" onClick={onBack}>
          <IoIosArrowBack /> Back
        </span>
      </div>
    </div>
  )
}
