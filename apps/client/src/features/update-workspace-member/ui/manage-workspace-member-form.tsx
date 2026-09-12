'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Role } from '@/entities/role'
import type { WorkspaceMember } from '@/entities/workspace-member'
import { formatDateTime } from '@/shared/lib/format-date'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  updateWorkspaceMemberSchema,
  type UpdateWorkspaceMemberFormValues,
} from '../model/update-workspace-member.schema'
import { workspaceMemberStatusOptions } from '../model/status-options'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { RemoveWorkspaceMemberButton } from '@/features/remove-workspace-member'

type ManageWorkspaceMemberFormProps = {
  member: WorkspaceMember
  roles: Role[]
  rolesLoading?: boolean
  isSubmitting?: boolean
  errorMessage?: string | null
  onSubmit: (values: UpdateWorkspaceMemberFormValues) => Promise<void> | void
  onCancel: () => void
  modalClose: () => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function prettifyRoleName(value: string): string {
  return value.replaceAll('_', ' ')
}

export function ManageWorkspaceMemberForm({
  member,
  roles,
  rolesLoading = false,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
  onCancel,
  modalClose,
}: ManageWorkspaceMemberFormProps) {
  const form = useForm<UpdateWorkspaceMemberFormValues>({
    resolver: zodResolver(updateWorkspaceMemberSchema),
    defaultValues: {
      roleId: member.roleId,
      status: member.status as UpdateWorkspaceMemberFormValues['status'],
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    form.reset({
      roleId: member.roleId,
      status: member.status as UpdateWorkspaceMemberFormValues['status'],
    })
  }, [form, member])

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Avatar size="lg">
              <AvatarImage />
              <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium">{member.displayName}</p>
              <p className="truncate text-sm">{member.email}</p>
              <p className="text-xs">
                {' '}
                Joined At {formatDateTime(member.joinedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:ml-auto sm:justify-end">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {prettifyRoleName(member.roleName)}
              </Badge>
              <Badge variant="outline">{member.status}</Badge>
            </div>
            <RemoveWorkspaceMemberButton
              onSuccess={modalClose}
              member={member}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          name="roleId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="role">Role</FieldLabel>

              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={rolesLoading || isSubmitting}
              >
                <SelectTrigger id="role" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="status">Status</FieldLabel>

              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  {workspaceMemberStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>

          <Input id="email" value={member.email} readOnly />

          <FieldDescription>Member email cannot be changed.</FieldDescription>
        </Field>
      </div>

      {!rolesLoading && roles.length === 0 ? (
        <p className="text-sm">No roles are available in this workspace.</p>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border p-3 text-sm">{errorMessage}</div>
      ) : null}

      <Separator />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          isLoading={isSubmitting || rolesLoading || roles.length === 0}
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}
