'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { useWorkspacePermissions } from '@/entities/permission'
import { WorkspaceRoleForm } from '@/features/workspace-role-form'
import type { WorkspaceRoleFormValues } from '@/features/workspace-role-form'
import { useCreateWorkspaceRoleMutation } from '../model/use-create-workspace-role'
import { Button } from '@/shared/ui/button'

type CreateWorkspaceRoleDialogProps = {
  workspaceId: string
  onCreated?: () => void
}

const initialValues: WorkspaceRoleFormValues = {
  name: '',
  description: '',
  permissionIds: [],
}

export function CreateWorkspaceRoleDialog({
  workspaceId,
  onCreated,
}: CreateWorkspaceRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const permissionsQuery = useWorkspacePermissions(workspaceId, {
    enabled: open,
  })
  const createRoleMutation = useCreateWorkspaceRoleMutation()

  async function handleSubmit(values: WorkspaceRoleFormValues) {
    setErrorMessage(null)

    try {
      const res = await createRoleMutation.mutateAsync({
        input: values,
      })

      console.log('RES', res);

      setOpen(false)
      onCreated?.()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setErrorMessage(null)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create role
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>
            Create a custom workspace role and assign permissions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-4">
          <WorkspaceRoleForm
            initialValues={initialValues}
            permissions={permissionsQuery.data ?? []}
            permissionsLoading={permissionsQuery.isLoading}
            permissionsError={
              permissionsQuery.error ? 'Failed to load permissions' : null
            }
            isSubmitting={createRoleMutation.isPending}
            errorMessage={errorMessage}
            submitLabel="Create role"
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
