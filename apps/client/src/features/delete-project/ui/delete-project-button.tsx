'use client'

import { useState } from 'react'

import { AlertCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useWorkspace } from '@/entities/workspace/model/workspace.store'

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
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Spinner } from '@/shared/ui/spinner'

import { useDeleteProjectMutation } from '../model/use-delete-project.mutation'
import { Button } from '@/shared/ui/button'

interface DeleteProjectButtonProps {
  readonly projectKey: string
  readonly projectName: string
}

export const DeleteProjectButton = ({
  projectKey,
  projectName,
}: DeleteProjectButtonProps) => {
  const router = useRouter()

  const deleteProject = useDeleteProjectMutation()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    await deleteProject.mutateAsync(projectKey)

    router.back()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full" size="sm" variant="destructive">
          <Trash2 /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm!">
        <AlertDialogHeader>
          <AlertDialogTitle className="w-full text-center">
            Delete “{projectName}”?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            This will permanently delete the project and its associated data.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />

            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter className="flex justify-around!">
          <AlertDialogCancel disabled={deleteProject.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            disabled={deleteProject.isPending}
            onClick={handleDelete}
          >
            {deleteProject.isPending && (
              <Spinner aria-hidden="true" data-icon="inline-start" />
            )}
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
