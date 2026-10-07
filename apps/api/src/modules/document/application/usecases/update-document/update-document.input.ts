import { DocumentContent } from '../../../domain/interfaces/document.interface'

/**
 * Input required to update an existing document.
 *
 * Workspace and actor identifiers are supplied by the authenticated
 * request context, while the document identifier identifies the
 * document being updated.
 */
export interface UpdateDocumentInput {
  readonly workspaceId: string
  readonly documentId: string

  readonly title?: string
  readonly content?: DocumentContent

  readonly actorId: string
}
