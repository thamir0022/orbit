import { Button } from '@orbit/ui/components/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@orbit/ui/components/field'
import { Input } from '@orbit/ui/components/input'
import { Step } from '../stepper'
import { Controller } from 'react-hook-form'
import { useProfile } from '../../model/useProfile'

export function ProfileSetupStep({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const { form, submit } = useProfile(() => setCurrentStep((c) => c + 1))

  return (
    <Step>
      <h2 className="text-center mb-5 sub-heading">Create Your Profile</h2>
      <form id="create-account-form" onSubmit={form.handleSubmit(submit)}>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    {...field}
                    id="firstName"
                    aria-invalid={fieldState.invalid}
                    placeholder="First Name"
                    className="py-6 px-3"
                    autoComplete="name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    {...field}
                    id="lastName"
                    aria-invalid={fieldState.invalid}
                    placeholder="Last Name"
                    className="py-6 px-3"
                    autoComplete="family-name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  aria-invalid={fieldState.invalid}
                  type="password"
                  placeholder="Password"
                  className="py-6 px-3"
                  autoComplete="new-password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <Input
                  {...field}
                  id="confirmPassword"
                  aria-invalid={fieldState.invalid}
                  type="password"
                  placeholder="Confirm Password"
                  className="py-6 px-3"
                  autoComplete="new-password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button
            type="submit"
            form="create-account-form"
            className="w-full py-6 cursor-pointer max-sm:font-bold font-medium"
          >
            Continue
          </Button>
        </FieldGroup>
      </form>
    </Step>
  )
}
