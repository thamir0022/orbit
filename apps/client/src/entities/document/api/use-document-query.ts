'use client'

import { useQuery } from '@tanstack/react-query'

import { documentKeys } from './document-keys'
import { getDocument } from './get-document.api'

/**
 * Retrieves a document by its identifier.
 */
export function useDocumentQuery(documentId: string) {
  return useQuery({
    queryKey: documentKeys.detail(documentId),

    queryFn: () => getDocument(documentId),

    enabled: Boolean(documentId),
  })
}
