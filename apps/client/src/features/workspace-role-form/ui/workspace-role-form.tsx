'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Separator } from '@/shared/ui/separator'
import { Button } from '@/shared/ui/button'
import type { WorkspacePermission } from '@/entities/permission'
import {
  workspaceRoleFormSchema,
  type WorkspaceRoleFormValues,
} from '../model/workspace-role-form.schema'
import { WorkspaceRolePermissionsSelector } from '@/features/workspace-role-permissions-selector'

type WorkspaceRoleFormProps = {
  initialValues: WorkspaceRoleFormValues
  permissions: WorkspacePermission[]
  permissionsLoading?: boolean
  permissionsError?: string | null
  isSubmitting?: boolean
  errorMessage?: string | null
  submitLabel: string
  onSubmit: (values: WorkspaceRoleFormValues) => Promise<void> | void
  onCancel: () => void
}

export function WorkspaceRoleForm({
  initialValues,
  permissions,
  permissionsLoading = false,
  permissionsError = null,
  isSubmitting = false,
  errorMessage = null,
  submitLabel,
  onSubmit,
  onCancel,
}: WorkspaceRoleFormProps) {
  const form = useForm<WorkspaceRoleFormValues>({
    resolver: zodResolver(workspaceRoleFormSchema),
    defaultValues: initialValues,
    mode: 'onSubmit',
  })

  useEffect(() => {
    form.reset(initialValues)
  }, [form, initialValues])

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="role-name">Role name</FieldLabel>
            <Input
              id="role-name"
              {...field}
              value={field.value}
              aria-invalid={fieldState.invalid}
              placeholder="Designer"
              disabled={isSubmitting}
            />
            <FieldDescription>
              Give the role a clear name that people can understand quickly.
            </FieldDescription>
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="role-description">Description</FieldLabel>
            <Textarea
              id="role-description"
              {...field}
              value={field.value}
              aria-invalid={fieldState.invalid}
              placeholder="Designer role can create and update user stories"
              disabled={isSubmitting}
              className="min-h-28"
            />
            <FieldDescription>
              Add a short summary that explains this role.
            </FieldDescription>
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        )}
      />

      <Separator />

      <Controller
        control={form.control}
        name="permissionIds"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Permissions</FieldLabel>
            <FieldDescription>
              Select the permissions this role should have.
            </FieldDescription>

            <WorkspaceRolePermissionsSelector
              permissions={permissions}
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
              loading={permissionsLoading}
              errorMessage={permissionsError}
            />

            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        )}
      />

      {errorMessage ? (
        <div className="rounded-2xl border p-4 text-sm">{errorMessage}</div>
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
