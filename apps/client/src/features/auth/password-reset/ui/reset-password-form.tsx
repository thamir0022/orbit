'use client'

import * as React from 'react'
import { AnimatePresence } from 'motion/react'
import { FieldGroup } from '@/shared/ui/field'

import { useResetPasswordFlow } from '../model/use-reset-password-flow'
import { SlideWrapper } from '@/shared/ui/slide-wrapper'
import { StepEmail } from './step-email'
import { StepOtp } from './step-otp'
import { StepPassword } from './step-password'

export function ResetPasswordForm() {
  const { state, form, actions } = useResetPasswordFlow()
  const { step, direction, isPending } = state

  const onFormSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    if (step === 'email') actions.submitEmail()
    else if (step === 'otp') actions.submitOtp()
    else if (step === 'password') actions.submitPassword()
  }

  return (
    <form onSubmit={onFormSubmit} className="w-full max-w-sm mx-auto">
      <FieldGroup>
        {/* CSS Grid hack: 'grid' and 'grid-template-areas' force children to share the exact same space, eliminating height jumps */}
        <div className="relative w-full overflow-hidden grid [grid-template-areas:'stack'] p-1">
          <AnimatePresence initial={false} custom={direction}>
            {step === 'email' && (
              <SlideWrapper
                key="step-email"
                direction={direction}
                className="w-full [grid-area:stack]"
              >
                <StepEmail
                  control={form.control}
                  isSubmitting={isPending}
                  onNext={actions.submitEmail}
                />
              </SlideWrapper>
            )}

            {step === 'otp' && (
              <SlideWrapper
                key="step-otp"
                direction={direction}
                className="w-full [grid-area:stack]"
              >
                <StepOtp
                  control={form.control}
                  email={form.getValues('email')}
                  isSubmitting={isPending}
                  onNext={actions.submitOtp}
                  onBack={() => actions.goBack('email')}
                  onResend={actions.resendOtp} // Hooked up the new resend action
                />
              </SlideWrapper>
            )}

            {step === 'password' && (
              <SlideWrapper
                key="step-password"
                direction={direction}
                className="w-full [grid-area:stack]"
              >
                <StepPassword
                  control={form.control}
                  isSubmitting={isPending}
                  onNext={actions.submitPassword}
                  onBack={() => actions.goBack('otp')}
                />
              </SlideWrapper>
            )}
          </AnimatePresence>
        </div>
      </FieldGroup>
    </form>
  )
}
