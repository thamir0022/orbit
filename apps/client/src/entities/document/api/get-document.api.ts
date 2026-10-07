import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import { Document } from '../model/document'

interface GetDocumentApiResponse {
  document: Document
}

export const getDocument = async (documentId: string): Promise<Document> => {
  const { data } = await httpClient.get<GetDocumentApiResponse>(
    API_ROUTES.DOCUMENTS.BY_ID(documentId)
  )

  return data.document
}
