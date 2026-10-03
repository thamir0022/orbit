import { DocumentListItemOutput } from '../../contracts/document-list-item.output'

/**
 * Output returned after successfully creating a document.
 */
export interface CreateDocumentOutput {
  readonly document: DocumentListItemOutput
}
