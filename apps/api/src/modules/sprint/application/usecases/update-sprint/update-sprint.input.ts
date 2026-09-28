/**
 * Input required to update a sprint.
 */
export interface UpdateSprintInput {
  readonly workspaceId: string
  readonly teamId: string
  readonly sprintId: string

  readonly name?: string
  readonly goal?: string
  readonly description?: string

  readonly startDate?: Date | string
  readonly endDate?: Date | string
}
