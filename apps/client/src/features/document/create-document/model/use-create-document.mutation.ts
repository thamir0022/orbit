'use client'

import {
  createDocument,
  CreateDocumentPayload,
} from '@/entities/document/api/create-document.api'
import { documentKeys } from '@/entities/document/api/document-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Provides the document creation mutation.
 *
 * Invalidates document list queries after successful creation so the
 * persistent document sidebar receives the new document.
 */
export function useCreateDocumentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: documentKeys.creates(),
    mutationFn: (payload: CreateDocumentPayload) => createDocument(payload),

    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
      })

      toast(res.message)
    },
  })
}
