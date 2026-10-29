'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { teamKeys } from '@/entities/team/model/team.query-keys'
import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { Alert, AlertDescription } from '@/shared/ui/alert'
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

interface DeleteTeamButtonProps {
  readonly teamKey: string
  readonly teamName: string
  readonly teamsPath: string
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function DeleteTeamButton({
  teamKey,
  teamName,
  teamsPath,
  open,
  onOpenChange,
}: DeleteTeamButtonProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const deletion = useMutation({
    mutationFn: () => httpClient.delete(API_ROUTES.TEAMS.BY_KEY(teamKey)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamKeys.all })
      router.replace(teamsPath)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{teamName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the team and its membership. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletion.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deletion.isPending}
            onClick={(event) => {
              event.preventDefault()
              setError(null)
              deletion.mutate(undefined, {
                onError: (cause) =>
                  setError(
                    cause instanceof Error
                      ? cause.message
                      : 'Unable to delete the team.'
                  ),
              })
            }}
          >
            Delete team
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
