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

export function SignUpDetailsStep() {
  // 1. Pull the navigation action from the store
  const registrationToken = useSignUpStore((state) => state.registrationToken)
  const nextStep = useSignUpStore((state) => state.nextStep)

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
  const { mutate: setupProfile, isPending } = useSignUpDetailsMutation(() => {
    nextStep()
  })

  // 4. Delegate submission to the mutation
  function onSubmit(data: ProfileStepData) {
    setupProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      registrationToken,
    })
  }

  return (
    <Step>
      <h2 className="text-center mb-5 sub-heading">Create Your Profile</h2>
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
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Continue'}
          </Button>
        </FieldGroup>
      </form>
    </Step>
  )
}
