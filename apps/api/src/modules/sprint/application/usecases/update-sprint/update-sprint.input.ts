/** Defines the actor and fields required to edit sprint planning. */
export interface UpdateSprintInput {
  readonly actorId: string
  readonly workspaceId: string
  readonly teamId: string
  readonly sprintId: string

  readonly name?: string
  readonly goal?: string | null
  readonly description?: string | null

  readonly startDate?: Date | string
  readonly endDate?: Date | string
}
