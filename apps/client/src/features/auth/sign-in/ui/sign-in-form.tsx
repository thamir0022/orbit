'use client'

import * as React from 'react'
import { AnimatePresence } from 'motion/react'

import { FieldGroup } from '@/shared/ui/field'
import { SlideWrapper } from '@/shared/ui/slide-wrapper'
import OrbitLogo from '@/shared/ui/orbit-logo'

import { useSignInFlow } from '../model/use-sign-in-flow'
import { SignInStepEmail } from './sign-in-step-email'
import { SignInStepPassword } from './sign-in-step-password'
import { WorkspaceSelectionDialog } from '@/widgets/workspace'

export function SignInForm() {
  const { state, form, actions } = useSignInFlow()

  const { step, direction, isSigningIn, workspaces, isWorkspaceSelectionOpen } =
    state

  const onFormSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (step === 'email') {
      void actions.submitEmail()
      return
    }

    void actions.submitPassword()
  }

  return (
    <>
      <form
        onSubmit={onFormSubmit}
        className="mx-auto w-full max-w-sm"
        noValidate
      >
        <div className="my-3 flex items-center justify-center">
          <OrbitLogo variant="brand_name" />
        </div>

        <FieldGroup>
          <div className="relative grid w-full overflow-hidden p-1 [grid-template-areas:'stack']">
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
                    isSubmitting={isSigningIn}
                    onBack={actions.goBack}
                  />
                </SlideWrapper>
              )}
            </AnimatePresence>
          </div>
        </FieldGroup>
      </form>

      <WorkspaceSelectionDialog
        open={isWorkspaceSelectionOpen}
        workspaces={workspaces}
        onOpenChange={(open) => {
          if (!open) {
            actions.closeWorkspaceSelection()
          }
        }}
        onSelect={actions.selectWorkspace}
        isPending={isSigningIn}
      />
    </>
  )
}
