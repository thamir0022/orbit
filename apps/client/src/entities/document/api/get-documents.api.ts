import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import { DocumentSummary } from '../model/document'

interface GetDocumentsApiResponse {
  documents: DocumentSummary[]
}

export const getDocuments = async (): Promise<DocumentSummary[]> => {
  const { data } = await httpClient.get<GetDocumentsApiResponse>(
    API_ROUTES.DOCUMENTS.BASE
  )

  return data.documents
}
