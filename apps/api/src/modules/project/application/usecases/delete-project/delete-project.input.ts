/**
 * Input for soft-deleting a project.
 */
export interface DeleteProjectInput {
  readonly workspaceId: string
  readonly projectKey: string
  readonly actorId: string
}
