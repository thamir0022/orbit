/**
 * Input required to retrieve a private document.
 *
 * Workspace and actor identifiers are supplied by the authenticated
 * request context rather than accepted directly from the client.
 */
export interface GetDocumentInput {
  readonly workspaceId: string
  readonly documentId: string
  readonly actorId: string
}
