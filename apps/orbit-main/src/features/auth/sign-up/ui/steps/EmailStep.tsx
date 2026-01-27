import { SocialAuth } from '@/shared/ui'
import { AuthSeparator } from '@/shared/ui'
import { AuthFooter } from '@/shared/ui'
import { Button } from '@orbit/ui/components/button'
import { Field, FieldError, FieldGroup } from '@orbit/ui/components/field'
import { Input } from '@orbit/ui/components/input'
import { Step } from '../stepper'
import { Controller } from 'react-hook-form'
import { useEmail } from '../../model/useEmail'
import React from 'react'

export function EmailStep({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const { form, submit } = useEmail(() => setCurrentStep((c) => c + 1))

  return (
    <Step className="flex flex-col gap-2 mx-auto">
      <SocialAuth />
      <AuthSeparator />
      <form onSubmit={form.handleSubmit(submit)} className="space-y-2">
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="email"
                  className="py-6 px-3  border-2"
                  placeholder="Email Address"
                  autoComplete="email"
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
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? 'Submitting...'
            : 'Continue with Email'}
        </Button>

        <AuthFooter />
      </form>
    </Step>
  )
}
