import { SprintListItemOutput } from '../../contracts/sprint-list-item.output'

/**
 * Output returned after successfully updating a sprint.
 */
export interface UpdateSprintOutput {
  readonly sprint: SprintListItemOutput
}
