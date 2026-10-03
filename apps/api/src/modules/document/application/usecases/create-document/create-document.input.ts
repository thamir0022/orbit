import { DocumentContent } from '../../../domain/interfaces/document.interface'

/**
 * Input required to create a new document.
 *
 * This contract contains application-friendly values and keeps
 * domain value objects out of external callers.
 */
export interface CreateDocumentInput {
  readonly workspaceId: string

  readonly title?: string
  readonly content: DocumentContent

  readonly actorId: string
}
