'use client'

import Stepper from './stepper'
import { useSignUpStepper } from '../model/useSignUpStepper'
import { EmailStep } from './steps/EmailStep'
import { OtpVerificationStep } from './steps/OtpVerificationStep'
import { ProfileSetupStep } from './steps/ProfileSetupStep'
import { OrganizationSetupStep } from './steps/OrganizationSetupStep'

export function SignUpStepper() {
  const { currentStep, setCurrentStep } = useSignUpStepper()

  return (
    <Stepper currentStep={currentStep}>
      <EmailStep setCurrentStep={setCurrentStep} />
      <OtpVerificationStep setCurrentStep={setCurrentStep} />
      <ProfileSetupStep setCurrentStep={setCurrentStep} />
      <OrganizationSetupStep />
    </Stepper>
  )
}
