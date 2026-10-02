/**
 * Input for retrieving a work item within a workspace.
 *
 * Values remain primitive at the application boundary.
 * Domain value objects are created inside the use case.
 */
export interface GetWorkItemInput {
  readonly workspaceId: string

  readonly key: string
}
