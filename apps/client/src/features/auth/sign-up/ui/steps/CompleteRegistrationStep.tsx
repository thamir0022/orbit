'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Step } from '@/shared/ui/stepper'

import { useSignUpStore } from '../../model/sign-up.store'
import {
  signUpDetailsSchema,
  type ProfileStepData,
} from '../../model/sign-up-details.schema'
import { useSignUpDetailsMutation } from '../../api/sign-up-details.mutation'
import PasswordField from '@/shared/ui/PasswordField'
import { useCompleteRegistrationMutation } from '../../api/complete-registration.mutation'

export function CompleteRegistrationStep() {
  // 1. Pull the navigation action from the store
  const {registrationToken, invitationToken} = useSignUpStore()

  // 2. Initialize the form with Zod validation
  const form = useForm<ProfileStepData>({
    resolver: zodResolver(signUpDetailsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  })

  // 3. Initialize TanStack Query mutation
  const { mutate: setupProfile, isPending } = useCompleteRegistrationMutation()

  // 4. Delegate submission to the mutation
  function onSubmit(data: ProfileStepData) {
    setupProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      registrationToken,
      invitationToken
    })
  }

  return (
    <Step>
      <h2 className="text-center mb-5 text-xl font-semibold">
        Create Your Profile
      </h2>
      <form
        id="create-account-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="flex flex-col gap-3">
          <div className="flex gap-3 w-full">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="w-full">
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    {...field}
                    id="firstName"
                    aria-invalid={fieldState.invalid}
                    placeholder="First Name"
                    className="py-6 px-3"
                    autoComplete="given-name"
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
                <Field data-invalid={fieldState.invalid} className="w-full">
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
                <PasswordField
                  {...field}
                  aria-invalid={fieldState.invalid}
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
                <PasswordField
                  {...field}
                  label="Confirm Password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Confirm Password"
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
            isLoading={isPending}
          >
            Create Account
          </Button>
        </FieldGroup>
      </form>
    </Step>
  )
}
