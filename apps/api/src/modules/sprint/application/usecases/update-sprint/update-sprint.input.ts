/**
 * Null text values explicitly clear the stored field.
 * Input required to update a sprint.
 */
export interface UpdateSprintInput {
  readonly workspaceId: string
  readonly teamId: string
  readonly sprintId: string

  readonly name?: string
  readonly goal?: string | null
  readonly description?: string | null

  readonly startDate?: Date | string
  readonly endDate?: Date | string
}
