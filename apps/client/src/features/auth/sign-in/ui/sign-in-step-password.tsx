import { Control, Controller } from 'react-hook-form'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { SignInFormData } from '../model/sign-in.schema'
import { IoIosArrowBack } from 'react-icons/io'
import PasswordField from '@/shared/ui/PasswordField'

export function SignInStepPassword({
  control,
  email,
  isSubmitting,
  onBack,
}: {
  control: Control<SignInFormData>
  email: string
  isSubmitting: boolean
  onBack: () => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-lg text-center text-muted-foreground">
        You are sign in as <span className="font-semibold">{email}</span>
      </p>
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <PasswordField {...field} aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full py-6">
        Sign In
      </Button>

      <div className="flex justify-center">
        <span className="w-fit link flex items-center" onClick={onBack}>
          <IoIosArrowBack /> Back
        </span>
      </div>
    </div>
  )
}
