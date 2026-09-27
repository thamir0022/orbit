/**
 * Input required to create a new sprint.
 *
 * This contract contains primitive values because application inputs
 * should not expose domain value objects to external callers.
 */
export interface CreateSprintInput {
  workspaceId: string
  teamId: string

  name: string
  goal?: string
  description?: string

  startDate: Date | string
  endDate: Date | string

  actorId: string
}
