/**
 * Input required to retrieve all active documents owned by a user.
 *
 * Workspace and actor identifiers are supplied by the authenticated
 * request context rather than accepted directly from the client.
 */
export interface GetDocumentsInput {
  readonly workspaceId: string
  readonly actorId: string
}
