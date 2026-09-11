'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { WorkspaceMember } from '@/entities/workspace-member'
import { Button } from '@/shared/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { useRemoveWorkspaceMemberMutation } from '../model/use-remove-workspace-member'

type RemoveWorkspaceMemberButtonProps = {
  member: WorkspaceMember
  onSuccess: () => void
}

export function RemoveWorkspaceMemberButton({
  member,
  onSuccess
}: RemoveWorkspaceMemberButtonProps) {
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const removeMemberMutation = useRemoveWorkspaceMemberMutation()

  async function handleRemove() {
    setErrorMessage(null)

    try {
      await removeMemberMutation.mutateAsync({
        memberId: member.userId,
      })

      setOpen(false)
      onSuccess()
    } catch (error: unknown) {
      setErrorMessage(
        (error instanceof Error && error.message) || 'Failed to remove member'
      )
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (removeMemberMutation.isPending) {
          return
        }

        setOpen(nextOpen)
        if (!nextOpen) {
          setErrorMessage(null)
        }
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Remove
      </Button>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{' '}
            <span className="font-medium">{member.displayName}</span> from the
            workspace. Their access will be revoked immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <div className="rounded-lg border p-3 text-sm">{errorMessage}</div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeMemberMutation.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={removeMemberMutation.isPending}
            onClick={async (event) => {
              event.preventDefault()
              await handleRemove()
            }}
          >
            {removeMemberMutation.isPending ? 'Removing...' : 'Remove member'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
