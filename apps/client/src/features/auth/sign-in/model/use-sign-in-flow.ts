'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SignInFormData, signInSchema } from '../model/sign-in.schema'
import { useSignInMutation } from '../api/sign-in.mutation'

type Step = 'email' | 'password'

export function useSignInFlow() {
  const [step, setStep] = React.useState<Step>('email')
  const [direction, setDirection] = React.useState(0)

  const { mutate: signIn, isPending } = useSignInMutation()

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  const submitEmail = async () => {
    const isValid = await form.trigger('email')
    if (isValid) {
      setDirection(1)
      setStep('password')
    }
  }

  const submitPassword = async () => {
    const isValid = await form.trigger('password')
    if (isValid) {
      const data = form.getValues()
      signIn(data)
    }
  }

  const goBack = () => {
    setDirection(-1)
    setStep('email')
  }

  return {
    state: { step, direction, isPending },
    form,
    actions: { submitEmail, submitPassword, goBack },
  }
}
