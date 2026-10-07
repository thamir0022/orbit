import { DocumentSummaryOutput } from '../../contracts/document-summary.output'

/**
 * Output returned after successfully retrieving the user's documents.
 */
export interface GetDocumentsOutput {
  readonly documents: readonly DocumentSummaryOutput[]
}
