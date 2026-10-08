import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

/**
 * Deletes a document.
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  await httpClient.delete(API_ROUTES.DOCUMENTS.BY_ID(documentId))
}
