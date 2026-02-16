import { Controller, type Control } from 'react-hook-form'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import type { ForgotPasswordData } from '../model/forgot-password.schema'

interface StepPasswordProps {
  control: Control<ForgotPasswordData>
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
    <div className="space-y-4 w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">
          Create a strong new password.
        </p>
      </div>

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="new-password">New Password</FieldLabel>
            <Input
              {...field}
              id="new-password"
              type="password"
              placeholder="At least 8 characters"
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
        className="w-full py-6"
      >
        Confirm Reset
      </Button>

      <Button variant="ghost" type="button" className="w-full" onClick={onBack}>
        Back
      </Button>
    </div>
  )
}
