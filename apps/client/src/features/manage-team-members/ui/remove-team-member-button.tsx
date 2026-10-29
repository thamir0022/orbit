'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/ui/alert-dialog'
import { useTeamMemberMutations } from '../model/use-team-member-mutations'

/** Confirms team removal and keeps failures visible for retry. */
export function RemoveTeamMemberButton({
  teamKey,
  userId,
  name,
}: {
  readonly teamKey: string
  readonly userId: string
  readonly name: string
}) {
  const [open, setOpen] = useState(false)
  const { remove } = useTeamMemberMutations(teamKey)
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!remove.isPending) {
          setOpen(value)
          remove.reset()
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${name} from team`}
        >
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will be removed from this team. Their workspace membership will
            remain.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {remove.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {remove.error.message}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={remove.isPending}
            onClick={(event) => {
              event.preventDefault()
              remove.mutate(userId, { onSuccess: () => setOpen(false) })
            }}
          >
            {remove.isPending ? 'Removing…' : 'Remove member'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
