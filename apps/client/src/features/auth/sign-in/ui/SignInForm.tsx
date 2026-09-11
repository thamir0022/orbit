'use client'

import * as React from 'react'
import { AnimatePresence } from 'motion/react'
import { FieldGroup } from '@/shared/ui/field'
import { SlideWrapper } from '@/shared/ui/slide-wrapper'
import { useSignInFlow } from '../model/use-sign-in-flow'
import { SignInStepEmail } from './sign-in-step-email'
import { SignInStepPassword } from './sign-in-step-password'
import OrbitLogo from '@/shared/ui/orbit-logo'

export function SignInForm() {
  const { state, form, actions } = useSignInFlow()
  const { step, direction, isPending } = state

  const onFormSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (step === 'email') {
      void actions.submitEmail()
    } else {
      actions.submitPassword()
    }
  }

  return (
    <form
      onSubmit={onFormSubmit}
      className="w-full max-w-sm mx-auto"
      noValidate
    >
      <div className="flex items-center justify-center my-3">
        <OrbitLogo variant="brand_name" />
      </div>
      <FieldGroup>
        <div className="relative w-full overflow-hidden grid [grid-template-areas:'stack'] p-1">
          <AnimatePresence initial={false} custom={direction}>
            {step === 'email' && (
              <SlideWrapper
                key="step-email"
                direction={direction}
                className="w-full [grid-area:stack]"
              >
                <SignInStepEmail control={form.control} />
              </SlideWrapper>
            )}

            {step === 'password' && (
              <SlideWrapper
                key="step-password"
                direction={direction}
                className="w-full [grid-area:stack]"
              >
                <SignInStepPassword
                  control={form.control}
                  email={form.getValues('email')}
                  isSubmitting={isPending}
                  onBack={actions.goBack}
                />
              </SlideWrapper>
            )}
          </AnimatePresence>
        </div>
      </FieldGroup>
    </form>
  )
}
