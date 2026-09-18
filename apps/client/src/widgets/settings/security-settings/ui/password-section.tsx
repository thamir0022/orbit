'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useUser } from '@/entities/user/model/user.store'

import { useChangePasswordMutation } from '../model/change-password.mutation'
import {
  changePasswordSchema,
  type ChangePasswordData,
} from '../model/change-password.schema'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/ui/field'
import PasswordField from '@/shared/ui/PasswordField'

export const PasswordSection = () => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  const user = useUser()
  const hasPassword = user?.hasPassword ?? false

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const { mutateAsync: changePassword } = useChangePasswordMutation()

  const handleDialogChange = (open: boolean) => {
    setPasswordDialogOpen(open)

    if (!open) {
      reset()
    }
  }

  const onSubmit = async (data: ChangePasswordData) => {
    const { currentPassword, newPassword } = data

    await changePassword({
      ...(hasPassword && { currentPassword }),
      newPassword,
    })

    reset()
    setPasswordDialogOpen(false)
  }

  return (
    <Field orientation="horizontal" className="min-h-14 justify-between py-2">
      <FieldContent className="my-auto min-w-36">
        <FieldLabel>Password</FieldLabel>

        {hasPassword && user?.passwordUpdatedAt && (
          <FieldDescription>
            Last updated{' '}
            {formatDistanceToNow(user.passwordUpdatedAt, {
              addSuffix: true,
            })}
          </FieldDescription>
        )}
      </FieldContent>

      <Dialog open={passwordDialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            {hasPassword ? 'Change' : 'Set password'}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {hasPassword ? 'Change password' : 'Set password'}
            </DialogTitle>

            <DialogDescription className="text-center">
              {hasPassword
                ? 'Enter your current password and choose a new one.'
                : 'Choose a strong password to secure your account.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {hasPassword && (
              <Field data-invalid={!!errors.currentPassword}>
                <PasswordField
                  id="current-password"
                  label="Current Password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.currentPassword}
                  {...register('currentPassword')}
                />

                {errors.currentPassword && (
                  <FieldError>{errors.currentPassword.message}</FieldError>
                )}
              </Field>
            )}

            <Field data-invalid={!!errors.newPassword}>
              <PasswordField
                id="new-password"
                label="New Password"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                {...register('newPassword')}
              />

              {errors.newPassword && (
                <FieldError>{errors.newPassword.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <PasswordField
                id="confirm-password"
                label="Confirm Password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />

              {errors.confirmPassword && (
                <FieldError>{errors.confirmPassword.message}</FieldError>
              )}
            </Field>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
              >
                {hasPassword ? 'Change' : 'Set password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Field>
  )
}
