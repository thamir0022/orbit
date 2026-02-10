'use client'

import { Input } from '@/components/ui/input'
import { Controller } from 'react-hook-form'
import { useSignIn } from '../model/useSignIn'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { AnimatePresence, Variants } from 'motion/react'
import { motion } from 'motion/react'
import { AuthFooter, AuthSeparator, SocialAuth } from '@/src/shared/ui'

const expandVariants: Variants = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: { opacity: 1, height: 'auto', marginTop: -10 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
}

export function SignInForm() {
  const { form, submit, verifyEmail, isEmailVerified, isCheckingEmail } =
    useSignIn()

  return (
    <motion.div
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: 'auto' }}
      transition={{ type: 'spring', duration: 0.4 }}
      className="flex flex-col gap-2 mx-auto"
    >
      <AnimatePresence>
        {!isEmailVerified && (
          <>
            <SocialAuth />
            <AuthSeparator />
          </>
        )}
      </AnimatePresence>

      <form
        id="sign-in-form"
        onSubmit={form.handleSubmit(submit)}
        className="space-y-2"
      >
        <FieldGroup>
          {/* Email */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  id="email"
                  aria-invalid={fieldState.invalid}
                  type="email"
                  className="px-3 py-6 border-2"
                  placeholder="Email Address"
                  autoComplete="email"
                  readOnly={isEmailVerified}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Password */}
          <AnimatePresence>
            {isEmailVerified && (
              <motion.div
                variants={expandVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
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
                        aria-invalid={fieldState.invalid}
                        type="password"
                        className="px-3 py-6"
                        placeholder="Enter your password"
                        autoComplete="current-password"
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

        <Button
          className="w-full py-6"
          type={isEmailVerified ? 'submit' : 'button'}
          onClick={!isEmailVerified ? verifyEmail : undefined}
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

        <AuthFooter
          text={isEmailVerified ? 'Forgot password?' : "Don't have an account?"}
          linkText={isEmailVerified ? 'Reset here' : 'Sign Up'}
          href={isEmailVerified ? '/forgot-password' : '/sign-up'}
        />
      </form>
    </motion.div>
  )
}
