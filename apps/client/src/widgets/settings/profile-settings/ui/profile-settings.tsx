'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useUser } from '@/entities/user/model/user.store'
import { Button } from '@/shared/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'

import { useUpdateProfileMutation } from '../model/use-update-profile'
import {
  profileSettingsSchema,
  type ProfileSettingsFormValues,
} from '../model/profile-settings.schema'
import { ProfileHeader } from './profile-header'

const getDefaultValues = (
  user: ReturnType<typeof useUser>
): ProfileSettingsFormValues => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  displayName: user?.displayName ?? '',
})

export const ProfileSettings = () => {
  const user = useUser()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation()

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: getDefaultValues(user),
    mode: 'onChange',
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, isValid },
  } = form

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    await updateProfile(values)
    reset(values)
  }

  const handleCancel = () => {
    reset(getDefaultValues(user))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full p-2">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>

        <p className="text-muted-foreground mt-1 text-sm">
          Manage your personal information.
        </p>
      </div>

      {/* Profile header */}
      <ProfileHeader
        firstName={user?.firstName}
        lastName={user?.lastName}
        displayName={user?.displayName}
        avatarUrl={user?.avatarUrl}
      />

      <Separator className="my-4" />

      {/* Personal information */}
      <section>
        <h2 className="text-lg font-medium">Personal Information</h2>

        <div className="space-y-2">
          {/* First name */}
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between border-b py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-36">
                  <FieldLabel htmlFor={field.name}>First name</FieldLabel>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="my-auto max-w-sm"
                />
              </Field>
            )}
          />

          {/* Last name */}
          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between border-b py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-36">
                  <FieldLabel htmlFor={field.name}>Last name</FieldLabel>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="my-auto max-w-sm"
                />
              </Field>
            )}
          />

          {/* Display name */}
          <Controller
            name="displayName"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-36">
                  <FieldLabel htmlFor={field.name}>Display name</FieldLabel>

                  <FieldDescription className="sr-only">
                    Name displayed throughout Orbit.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="my-auto max-w-sm"
                />
              </Field>
            )}
          />
        </div>
      </section>

      <Separator className="my-4" />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting || isPending}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={!isDirty || !isValid}
          isLoading={isSubmitting || isPending}
        >
          Save
        </Button>
      </div>
    </form>
  )
}
