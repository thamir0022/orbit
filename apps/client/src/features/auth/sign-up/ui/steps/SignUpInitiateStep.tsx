'use client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field, FieldError, FieldGroup } from '@/shared/ui/field'
import { SocialAuth } from '@/features/auth/ui/SocialAuth' // Adjust path if needed
import { AuthSeparator } from '@/features/auth/ui/AuthSeparator'
import { AuthFooter } from '@/features/auth/ui/AuthFooter'
import { Step } from '@/shared/ui/stepper'

import {
  signUpInitiateSchema,
  type EmailStepData,
} from '../../model/sign-up-initiate.schema'
import { useSignUpStore } from '../../model/sign-up.store'
import { useSignUpMutation } from '../../api/sign-up-initiate.mutation'

export function SignUpInitiateStep() {
  // 1. Pull what we need from our global step store
  const nextStep = useSignUpStore((state) => state.nextStep)
  const setEmail = useSignUpStore((state) => state.setEmail)
  const savedEmail = useSignUpStore((state) => state.email)

  // 2. Initialize the form
  const form = useForm<EmailStepData>({
    resolver: zodResolver(signUpInitiateSchema),
    defaultValues: {
      email: savedEmail || '',
    },
  })

  // 3. Initialize the mutation, passing the success behavior
  const { mutate: sendOtp, isPending } = useSignUpMutation(() => {
    // When the API succeeds, save the email to state and advance the UI
    setEmail(form.getValues('email'))
    nextStep()
  })

  // 4. Form submission handler
  function onSubmit(data: EmailStepData) {
    sendOtp(data)
  }

  return (
    <Step className="flex flex-col gap-2 mx-auto">
      <SocialAuth />

      <AuthSeparator />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2"
        noValidate
      >
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  id="sign-up-email"
                  type="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  className="py-6 px-3 border-2"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          className="w-full py-6 cursor-pointer"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Sending code...' : 'Continue with Email'}
        </Button>

        <AuthFooter />
      </form>
    </Step>
  )
}
