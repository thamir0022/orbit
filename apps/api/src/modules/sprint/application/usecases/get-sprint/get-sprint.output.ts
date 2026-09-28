import { SprintListItemOutput } from '../../contracts/sprint-list-item.output'

/**
 * Output returned for a single sprint.
 */
export interface GetSprintOutput {
  readonly sprint: SprintListItemOutput
}
