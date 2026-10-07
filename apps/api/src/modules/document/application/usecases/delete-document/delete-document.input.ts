/**
 * Input required to delete an existing document.
 *
 * Workspace and actor identifiers are supplied by the authenticated
 * request context, while the document identifier identifies the
 * document being deleted.
 */
export interface DeleteDocumentInput {
  readonly workspaceId: string
  readonly documentId: string
  readonly actorId: string
}
