'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@orbit/ui/components/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@orbit/ui/components/field'
import { Input } from '@orbit/ui/components/input'
import { Separator } from '@orbit/ui/components/separator'
import { AnimatePresence, motion, Variants } from 'motion/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { z } from 'zod'

// -----------------------------------------------------------------------------
// 1. Schemas & Types
// -----------------------------------------------------------------------------
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = z.infer<typeof signInSchema>

// -----------------------------------------------------------------------------
// 2. Animation Variants (Defined outside to prevent re-creation on render)
// -----------------------------------------------------------------------------
const collapseVariants: Variants = {
  initial: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0, overflow: 'hidden' },
}

const expandVariants: Variants = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: { opacity: 1, height: 'auto', marginTop: -10 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
}

// -----------------------------------------------------------------------------
// 3. Sub-components
// -----------------------------------------------------------------------------
function SocialLogins() {
  return (
    <motion.div
      variants={collapseVariants}
      initial="initial"
      exit="exit"
      className="flex flex-col gap-2"
    >
      <Button variant="outline" className="cursor-pointer border-2 py-6">
        <FcGoogle className="size-7" />
        Continue with Google
      </Button>
      <Button variant="outline" className="cursor-pointer border-2 py-6">
        <FaGithub size="20" className="size-7" /> Continue with GitHub
      </Button>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="whitespace-nowrap text-xs font-medium">OR</span>
        <Separator className="flex-1" />
      </div>
    </motion.div>
  )
}

// -----------------------------------------------------------------------------
// 4. Main Component
// -----------------------------------------------------------------------------
export default function SignInPage() {
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  // Declarative focus management: Auto-focus password when email is verified
  useEffect(() => {
    if (isEmailVerified) {
      form.setFocus('password')
    }
  }, [isEmailVerified, form])

  // Handlers
  const handleEmailVerification = async () => {
    const isValid = await form.trigger('email')
    if (!isValid) return

    setIsCheckingEmail(true)

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsEmailVerified(true)
    } catch (error) {
      console.error('Email verification failed:', error)
      form.setError('email', { message: 'Failed to verify email.' })
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleFinalSubmit = async (data: FormValues) => {
    console.log('Final Login Attempt:', data)
    // TODO: Final login API call
  }

  // Derived state for button text/links
  const footerText = isEmailVerified
    ? 'Forgot password? '
    : "Don't have an account? "
  const footerLinkText = isEmailVerified ? 'Reset here' : 'Sign Up'

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>{!isEmailVerified && <SocialLogins />}</AnimatePresence>

      <form
        onSubmit={form.handleSubmit(handleFinalSubmit)}
        className="space-y-2"
      >
        <FieldGroup>
          {/* Email Field */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  className="px-3 py-6"
                  placeholder="Email Address"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  readOnly={isEmailVerified}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Password Field (Animated) */}
          <AnimatePresence>
            {isEmailVerified && (
              <motion.div
                variants={expandVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Password</FieldLabel>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        className="px-3 py-6"
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
              </motion.div>
            )}
          </AnimatePresence>
        </FieldGroup>

        {/* Dynamic Action Button */}
        <Button
          className="w-full cursor-pointer py-6"
          type={isEmailVerified ? 'submit' : 'button'}
          onClick={!isEmailVerified ? handleEmailVerification : undefined}
          disabled={isCheckingEmail || form.formState.isSubmitting}
        >
          {isCheckingEmail
            ? 'Checking...'
            : form.formState.isSubmitting
              ? 'Signing in...'
              : isEmailVerified
                ? 'Sign In'
                : 'Continue with Email'}
        </Button>

        {/* Footer Links */}
        <p className="text-center max-sm:text-sm">
          {footerText}
          <Link className="link" href="/sign-up">
            {footerLinkText}
          </Link>
        </p>
      </form>
    </div>
  )
}
