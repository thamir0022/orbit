'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  documentKeys,
  type UpdateDocumentPayload,
  type Document,
} from '@/entities/document'

import { updateDocument } from '@/entities/document/api/update-document.api'

interface UpdateDocumentMutationInput {
  readonly documentId: string
  readonly payload: UpdateDocumentPayload
}

/**
 * Provides the mutation for updating a document.
 */
export function useUpdateDocumentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: documentKeys.updates(),

    mutationFn: ({ documentId, payload }: UpdateDocumentMutationInput) =>
      updateDocument(documentId, payload),

    onSuccess: async (response, variables) => {
      const updatedDocument = response.data.document

      /*
       * Keep the document detail cache synchronized with the
       * document returned by the server.
       */
      queryClient.setQueryData<Document>(
        documentKeys.detail(variables.documentId),
        updatedDocument
      )

      /*
       * Refresh document summaries/list data, especially the
       * sidebar title.
       */
      await queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
      })
    },
  })
}
