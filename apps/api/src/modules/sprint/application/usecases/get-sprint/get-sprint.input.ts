/**
 * Input for retrieving a single sprint.
 */
export interface GetSprintInput {
  readonly workspaceId: string
  readonly teamId: string
  readonly sprintId: string
}
