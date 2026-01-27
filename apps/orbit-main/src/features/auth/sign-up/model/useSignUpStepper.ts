'use client'

import { useState } from 'react'

export function useSignUpStepper() {
  const [currentStep, setCurrentStep] = useState(1)

  return {
    currentStep,
    setCurrentStep,
  }
}
