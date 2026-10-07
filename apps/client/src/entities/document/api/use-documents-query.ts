'use client'

import { useQuery } from '@tanstack/react-query'

import { documentKeys } from './document-keys'
import { getDocuments } from './get-documents.api'

/**
 * Retrieves the authenticated user's document summaries.
 *
 * Used by the document navigation sidebar.
 */
export function useDocumentsQuery() {
  return useQuery({
    queryKey: documentKeys.list(),

    queryFn: getDocuments,
  })
}
