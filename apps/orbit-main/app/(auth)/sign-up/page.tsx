'use client'

import { useState } from 'react'
import Stepper from '@orbit/ui/components/stepper'
import Step1 from './steps/step-1'
import Step2 from './steps/step-2'
import Step3 from './steps/step-3'
import Step4 from './steps/step.4'

export default function Page() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <Stepper currentStep={currentStep}>
      <Step1 setCurrentStep={setCurrentStep} />

      <Step2 setCurrentStep={setCurrentStep} />

      <Step3 setCurrentStep={setCurrentStep} />

      <Step4 setCurrentStep={setCurrentStep} />
    </Stepper>
  )
}
