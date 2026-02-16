'use client'

import * as React from 'react'
import { AnimatePresence } from 'motion/react'
import { FieldGroup } from '@/shared/ui/field'

import { useResetPassword } from '../model/use-reset-password'
import { SlideWrapper } from './slide-wrapper'
import { StepEmail } from './step-email'
import { StepOtp } from './step-otp'
import { StepPassword } from './step-password'

export function ForgotPasswordForm() {
  const { step, direction, form, actions } = useResetPassword()
  const { isSubmitting } = form.formState

  // Prevent default HTML form submission
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'email') actions.submitEmail()
    else if (step === 'otp') actions.submitOtp()
    else if (step === 'password') actions.submitPassword()
  }

  return (
    <form onSubmit={onFormSubmit} className="w-full max-w-sm mx-auto">
      <FieldGroup>
        <div className="relative overflow-hidden w-full min-h-75 p-1 flex items-center">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {step === 'email' && (
              <SlideWrapper
                key="step-email"
                direction={direction}
                className="w-full"
              >
                <StepEmail
                  control={form.control}
                  isSubmitting={isSubmitting}
                  onNext={actions.submitEmail}
                />
              </SlideWrapper>
            )}

            {step === 'otp' && (
              <SlideWrapper
                key="step-otp"
                direction={direction}
                className="w-full"
              >
                <StepOtp
                  control={form.control}
                  email={form.getValues('email')}
                  isSubmitting={isSubmitting}
                  onNext={actions.submitOtp}
                  onBack={() => actions.goBack('email')}
                />
              </SlideWrapper>
            )}

            {step === 'password' && (
              <SlideWrapper
                key="step-password"
                direction={direction}
                className="w-full"
              >
                <StepPassword
                  control={form.control}
                  isSubmitting={isSubmitting}
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
