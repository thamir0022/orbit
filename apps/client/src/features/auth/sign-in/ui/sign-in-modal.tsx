'use client'

import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field'
import { SignInFormData, signInSchema } from '../model/sign-in.schema'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import OrbitLogo from '@/shared/ui/orbit-logo'

export function SignInModal() {
  const router = useRouter()

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: SignInFormData) => {
    console.log(values)
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center">
          <OrbitLogo variant="brand_name" />
          <DialogTitle>Sign In To Your Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            type="button"
            href="/sign-up"
            className="font-medium text-foreground hover:underline"
          >
            Create Account
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  )
}
