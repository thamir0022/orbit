'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence, type Transition } from 'motion/react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { SocialAuth } from '../../ui/SocialAuth'
import { SignInFormData, signInSchema } from '../model/sign-in.schema'
import { axiosInstance } from '@/shared/lib/axios.instance'
import type { ApiResponse } from '@/shared/api/types/api.types'
import type { SignInData } from '../model/sign-in.reponse'
import { isAxiosError } from 'axios'
import { AuthSeparator } from '../../ui/AuthSeparator'
import Link from 'next/link'

// Simplified variants: No manual position/zIndex needed with mode="popLayout"
const VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? '110%' : '-110%',
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '110%' : '-110%',
    opacity: 0,
    filter: 'blur(4px)',
  }),
}

const TRANSITION: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
}

export function SignInForm() {
  const [step, setStep] = React.useState<'email' | 'password'>('email')
  const [direction, setDirection] = React.useState(0)
  const router = useRouter()

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function handleContinue() {
    const valid = await form.trigger('email')
    if (valid) {
      setDirection(1)
      setStep('password')
    }
  }

  function handleBack() {
    setDirection(-1)
    setStep('email')
  }

  async function onSubmit(data: SignInFormData) {
    try {
      const res = await axiosInstance.post<ApiResponse<SignInData>>(
        '/auth/sign-in',
        data
      )
      if (res.data.success) {
        toast.success(res.data.message)
        router.push('/')
      }
    } catch (error: unknown) {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : 'Something went wrong!'
      toast.error(errorMsg)
    }
  }

  return (
    <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="relative overflow-hidden w-full p-1">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {step === 'email' ? (
              <motion.div
                key="email-step"
                custom={direction}
                variants={VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={TRANSITION}
                className="space-y-2 w-full"
              >
                <SocialAuth />

                <AuthSeparator />

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        id="sign-in-email"
                        type="email"
                        placeholder="Email Address"
                        autoComplete="username"
                        aria-invalid={fieldState.invalid}
                        className="px-3 py-6 border-2"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Button
                  type="button"
                  onClick={handleContinue}
                  className="cursor-pointer w-full py-6"
                >
                  Continue with Email
                </Button>
                <p className="text-center">
                  Don&apos;t have an account?{' '}
                  <Link href="/sign-up" className="link">
                    SignUp
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="password-step"
                custom={direction}
                variants={VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={TRANSITION}
                className="space-y-4 w-full" // Ensure width full
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Signing in as{' '}
                    <span className="font-medium">
                      {form.getValues('email')}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="cursor-pointer text-xs font-semibold text-primary"
                  >
                    Change
                  </button>
                </div>

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="sign-in-password">
                        Password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="sign-in-password"
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        aria-invalid={fieldState.invalid}
                        className="px-3 py-6 border-2"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="cursor-pointer w-full py-6"
                >
                  {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
                <p className="text-center">
                  Forgot Password?{' '}
                  <Link href="forgot-password" className="link">
                    Reset here
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FieldGroup>
    </form>
  )
}
