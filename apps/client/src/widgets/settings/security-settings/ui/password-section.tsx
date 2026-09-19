'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useUser } from '@/entities/user/model/user.store'

import { useChangePasswordMutation } from '../model/use-change-password.mutation'
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const user = useUser()

  const hasPassword = user?.hasPassword ?? false
  const passwordUpdatedAt = user?.passwordUpdatedAt

  const title = hasPassword ? 'Change Password' : 'Set Password'

  const description = hasPassword
    ? 'Enter your current password and choose a new one.'
    : 'Choose a strong password to secure your account.'

  const actionLabel = hasPassword ? 'Change' : 'Set Password'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema(hasPassword)),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const { mutateAsync: changePassword, isPending } = useChangePasswordMutation()

  const isLoading = isSubmitting || isPending

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)

    if (!open) {
      reset()
    }
  }

  const onSubmit = async (data: ChangePasswordData) => {
    const payload = {
      newPassword: data.newPassword,
      ...(hasPassword && {
        currentPassword: data.currentPassword,
      }),
    }

    await changePassword(payload)

    reset()
    setIsDialogOpen(false)
  }

  if (!user) {
    return null
  }

  return (
    <Field orientation="horizontal" className="min-h-14 justify-between py-2">
      <FieldContent className="my-auto min-w-36">
        <FieldLabel>Password</FieldLabel>

        <FieldDescription className="text-xs">
          {hasPassword && passwordUpdatedAt
            ? `Last updated ${formatDistanceToNow(new Date(passwordUpdatedAt), {
                addSuffix: true,
              })}`
            : 'No password is set yet. Add one to keep your account secure.'}
        </FieldDescription>
      </FieldContent>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            {actionLabel}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{title}</DialogTitle>

            <DialogDescription className="text-center">
              {description}
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
                  disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
                onClick={() => handleDialogChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!isValid || isLoading}
                isLoading={isLoading}
              >
                {actionLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Field>
  )
}
