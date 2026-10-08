'use client'

import { Loader2 } from 'lucide-react'

import type { DocumentSummary } from '@/entities/document'

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

import { useDeleteDocumentMutation } from '../model/use-delete-document.mutation'
import { Button } from '@/shared/ui/button'

interface DocumentDeleteDialogProps {
  readonly document: DocumentSummary | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onDeleted: (documentId: string) => void
}

/**
 * Confirms and deletes a document.
 */
export function DocumentDeleteDialog({
  document,
  open,
  onOpenChange,
  onDeleted,
}: DocumentDeleteDialogProps) {
  const deleteDocumentMutation = useDeleteDocumentMutation()

  const isDeleting = deleteDocumentMutation.isPending

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) {
      return
    }

    if (nextOpen) {
      deleteDocumentMutation.reset()
    }

    onOpenChange(nextOpen)
  }

  const handleDelete = async () => {
    if (!document) {
      return
    }

    try {
      await deleteDocumentMutation.mutateAsync({
        documentId: document.id,
      })

      onOpenChange(false)
      onDeleted(document.id)
    } catch {
      // The mutation state exposes the error to the dialog.
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center w-full">
            Delete document?
          </AlertDialogTitle>

          <AlertDialogDescription>
            {document ? (
              <>
                Are you sure you want to delete{' '}
                <span className="font-medium text-foreground">
                  {document.title || 'Untitled'}
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              'Are you sure you want to delete this document? This action cannot be undone.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteDocumentMutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            Unable to delete the document. Please try again.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            asChild
            disabled={!document || isDeleting}
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
            className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive"
          >
            <Button disabled={isDeleting} variant="destructive">
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
