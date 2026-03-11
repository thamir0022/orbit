'use client'

import { Stepper } from '@/shared/ui/stepper' // Adjusted to match standard FSD shared path
import { useSignUpStore } from '../model/sign-up.store'
import { SignUpInitiateStep } from './steps/SignUpInitiateStep'
import { SignUpVerifyStep } from './steps/SignUpVerifyStep'
import { SignUpDetailsStep } from './steps/SignUpDetailsStep'
import { SignUpCompleteStep } from './steps/SignUpComplete'

export function SignUpStepper() {
  const currentStep = useSignUpStore((state) => state.currentStep)

  return (
    <Stepper currentStep={currentStep}>
      <SignUpInitiateStep />
      <SignUpVerifyStep />
      <SignUpDetailsStep />
      <SignUpCompleteStep />
    </Stepper>
  )
}
