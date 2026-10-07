import { DocumentListItemOutput } from '../../contracts/document-list-item.output'

/**
 * Output returned after successfully retrieving a document.
 */
export interface GetDocumentOutput {
  readonly document: DocumentListItemOutput
}
