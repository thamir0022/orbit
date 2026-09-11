'use client'

import { useEffect } from 'react'
import type { Role } from '@/entities/role'
import {
  inviteMemberSchema,
  type InviteMemberFormData,
} from '../model/invite-member.schema'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Loader } from 'lucide-react'
import { Button } from '@/shared/ui/button'

type InviteMemberFormProps = {
  roles: Role[]
  rolesLoading?: boolean
  rolesError?: string | null
  isSubmitting?: boolean
  errorMessage?: string | null
  onSubmit: (values: InviteMemberFormData) => Promise<void> | void
}

export function InviteMemberForm({
  roles,
  rolesLoading,
  rolesError = null,
  errorMessage = null,
  onSubmit,
}: InviteMemberFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      roleId: '',
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    if (!errorMessage) return
  }, [errorMessage])

  const hasRoles = roles.length > 0

  return (
    <form
      className=""
      id="invite-member-form"
      onSubmit={handleSubmit(onSubmit)}
    >
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
                placeholder="Enter the invitee email"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {rolesLoading ? (
          <Loader className="size-7 animate-spin" />
        ) : (
          <Controller
            name="roleId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Select onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full max-w-48"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles</SelectLabel>
                      {roles.map((item) => (
                        <SelectItem
                          className="cursor-pointer"
                          key={item.id}
                          value={item.id}
                        >
                          {item.name.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}
        <p className="text-center text-destructive font-semibold">
          {rolesError}
        </p>
      </FieldGroup>
    </form>
  )
}
