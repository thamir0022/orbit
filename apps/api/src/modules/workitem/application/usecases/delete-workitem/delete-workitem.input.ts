/**
 * Input for soft deleting a work item within a workspace.
 *
 */
export interface DeleteWorkItemInput {
  readonly workspaceId: string

  readonly key: string
}
