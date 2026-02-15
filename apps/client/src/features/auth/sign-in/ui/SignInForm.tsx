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
import { Separator } from '@/shared/ui/separator'
import { SocialAuth } from '../../ui/SocialAuth'
import { SignInFormData, signInSchema } from '../model/sign-in.schema'
import { axiosInstance } from '@/shared/lib/axios.instance'
import type { ApiResponse } from '@/shared/api/types/api.types'
import type { SignInData } from '../model/sign-in.reponse'
import { isAxiosError } from 'axios'
import { useUserStore } from '@/entities/user/model/user.store'

const VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    position: 'absolute' as const,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    position: 'relative' as const,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    position: 'absolute' as const,
  }),
}

const TRANSITION: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
}

export function SignInForm() {
  const [step, setStep] = React.useState<'email' | 'password'>('email')
  const [direction, setDirection] = React.useState(0)
  const router = useRouter()
  const { setUser, setAccessToken } = useUserStore()

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
        const { data } = res.data
        setUser(data.user)
        setAccessToken(data.tokens.accessToken)
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
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          {step === 'email' ? (
            <motion.div
              key="email-step"
              custom={direction}
              variants={VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION}
              className="space-y-4"
            >
              <SocialAuth />

              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs font-semibold text-muted-foreground">
                  OR
                </span>
                <Separator className="flex-1" />
              </div>

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="sign-in-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="username"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button type="button" onClick={handleContinue} className="w-full">
                Continue with Email
              </Button>
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
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Signing in as{' '}
                  <span className="font-medium">{form.getValues('email')}</span>
                </p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-semibold text-primary"
                >
                  Change
                </button>
              </div>

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="sign-in-password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
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
                className="w-full"
              >
                {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </FieldGroup>
    </form>
  )
}
