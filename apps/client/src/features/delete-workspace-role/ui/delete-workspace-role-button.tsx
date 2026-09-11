'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import type { WorkspaceRole } from '@/entities/role'
import { useDeleteWorkspaceRoleMutation } from '../model/use-delete-workspace-role'

type DeleteWorkspaceRoleButtonProps = {
  role: WorkspaceRole
}

export function DeleteWorkspaceRoleButton({
  role,
}: DeleteWorkspaceRoleButtonProps) {
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const deleteRoleMutation = useDeleteWorkspaceRoleMutation()

  async function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setErrorMessage(null)

    try {
      await deleteRoleMutation.mutateAsync({
        roleId: role.id,
      })

      setOpen(false)
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (deleteRoleMutation.isPending) return
        setOpen(nextOpen)
        if (!nextOpen) setErrorMessage(null)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete role</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{' '}
            <span className="font-medium">{role.name}</span>. Members assigned
            to this role may need to be reassigned first.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <div className="rounded-2xl border p-4 text-sm">{errorMessage}</div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteRoleMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteRoleMutation.isPending}
            onClick={handleDelete}
          >
            {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete role'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
