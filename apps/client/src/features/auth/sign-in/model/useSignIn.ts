import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { signInSchema, SignInFormData } from './signIn.schema'
import { useState } from 'react'

export function useSignIn() {
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  })

  const verifyEmail = async () => {
    const isValid = await form.trigger('email')
    if (!isValid) return

    setIsCheckingEmail(true)

    try {
      // TODO: replace with real API
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsEmailVerified(true)
    } catch (error) {
      console.error(error)
      form.setError('email', { message: 'Failed to verify email.' })
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const submit = async (data: SignInFormData) => {
    // call api
    console.log(data)
  }

  return { form, submit, verifyEmail, isEmailVerified, isCheckingEmail }
}
