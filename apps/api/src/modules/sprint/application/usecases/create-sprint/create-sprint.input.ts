/**
 * Input required to create a new sprint.
 *
 * This contract contains primitive values because application inputs
 * should not expose domain value objects to external callers.
 */
export interface CreateSprintInput {
  workspaceId: string
  teamKey: string

  name: string
  goal: string | null
  description: string | null

  startDate: Date | string
  endDate: Date | string

  actorId: string
}
