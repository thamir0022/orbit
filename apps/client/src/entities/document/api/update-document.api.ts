import { httpClient } from '@/shared/api/config/http-client'
import { DocumentContent } from '../model/document.types'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import { Document } from '../model/document'

export interface UpdateDocumentPayload {
  readonly title?: string
  readonly content?: DocumentContent
}

export interface UpdateDocumentResponse {
  document: Document
}

export const updateDocument = async (
  documentId: string,
  payload: UpdateDocumentPayload
) => {
  const res = await httpClient.patch<UpdateDocumentResponse>(
    API_ROUTES.DOCUMENTS.BY_ID(documentId),
    payload
  )

  return res
}
