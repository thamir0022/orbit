'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { documentKeys } from '@/entities/document'
import { deleteDocument } from '@/entities/document/api/delete-document.api'

interface DeleteDocumentMutationInput {
  readonly documentId: string
}

/**
 * Provides the mutation for deleting a document.
 *
 * The deleted document detail is removed from the query cache and
 * the document list is invalidated after a successful deletion.
 */
export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: documentKeys.deletes(),

    mutationFn: ({ documentId }: DeleteDocumentMutationInput) =>
      deleteDocument(documentId),

    onSuccess: async (_data, variables) => {
      queryClient.removeQueries({
        queryKey: documentKeys.detail(variables.documentId),
        exact: true,
      })

      await queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
      })
    },
  })
}
