import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { DocumentContent } from '../model/document.types'

import { Document } from '../model/document'

export interface CreateDocumentPayload {
  readonly title?: string
  readonly content: DocumentContent
}

interface CreateDocumentResponse {
  document: Document
}

export const createDocument = async (payload: CreateDocumentPayload) => {
  const res = await httpClient.post<CreateDocumentResponse>(
    API_ROUTES.DOCUMENTS.BASE,
    payload
  )

  return res
}
