'use client'

import { useMemo, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'

import { useWorkspacePermissions } from '@/entities/permission'
import { useWorkspaceRole } from '@/entities/role'
import type { WorkspaceRole } from '@/entities/role'

import { WorkspaceRoleForm } from '@/features/workspace-role-form'
import type { WorkspaceRoleFormValues } from '@/features/workspace-role-form'

import { useUpdateWorkspaceRoleMutation } from '../model/use-update-workspace-role'

type UpdateWorkspaceRoleDialogProps = {
  workspaceId: string
  role: WorkspaceRole
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toFormValues(role: WorkspaceRole): WorkspaceRoleFormValues {
  return {
    name: role.name,
    description: role.description ?? '',
    permissionIds: role.permissionIds ?? [],
  }
}

export function UpdateWorkspaceRoleDialog({
  workspaceId,
  role,
  open,
  onOpenChange,
}: UpdateWorkspaceRoleDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const roleQuery = useWorkspaceRole(workspaceId, role.id, {
    enabled: open,
    placeholderData: role,
  })

  const permissionsQuery = useWorkspacePermissions(workspaceId, {
    enabled: open,
  })

  const updateRoleMutation = useUpdateWorkspaceRoleMutation()

  const initialValues = useMemo(
    () => toFormValues(roleQuery.data ?? role),
    [roleQuery.data, role]
  )

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setErrorMessage(null)
    }

    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: WorkspaceRoleFormValues) {
    setErrorMessage(null)

    try {
      await updateRoleMutation.mutateAsync({
        roleId: role.id,
        input: values,
      })

      handleOpenChange(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update role.'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Manage role</DialogTitle>
          <DialogDescription>
            Edit the role name, description, and permissions.
          </DialogDescription>
        </DialogHeader>

        {roleQuery.isLoading ? (
          <div className="space-y-4 rounded-2xl border p-4">
            Loading role details...
          </div>
        ) : (
          <ScrollArea className="max-h-[80vh] pr-4">
            <WorkspaceRoleForm
              initialValues={initialValues}
              permissions={permissionsQuery.data ?? []}
              permissionsLoading={permissionsQuery.isLoading}
              permissionsError={
                permissionsQuery.error ? 'Failed to load permissions' : null
              }
              isSubmitting={updateRoleMutation.isPending}
              errorMessage={errorMessage}
              submitLabel="Save changes"
              onSubmit={handleSubmit}
              onCancel={() => handleOpenChange(false)}
            />
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
