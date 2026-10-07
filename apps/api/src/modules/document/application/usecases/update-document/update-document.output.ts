import { DocumentListItemOutput } from '../../contracts/document-list-item.output'

/**
 * Output returned after successfully updating a document.
 */
export interface UpdateDocumentOutput {
  readonly document: DocumentListItemOutput
}
