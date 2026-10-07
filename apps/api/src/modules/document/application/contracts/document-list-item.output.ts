import { UserSummaryOutput } from '@/shared/application/contracts'
import { DocumentContent } from '../../domain/interfaces/document.interface'

/**
 * Represents the application-level read projection for a document list item.
 *
 * Contains document metadata and ownership information without exposing
 * the full rich-text document content.
 */
export interface DocumentListItemOutput {
  id: string

  title: string

  owner: UserSummaryOutput
  createdBy: UserSummaryOutput

  content: DocumentContent

  createdAt: Date
  updatedAt: Date
}
