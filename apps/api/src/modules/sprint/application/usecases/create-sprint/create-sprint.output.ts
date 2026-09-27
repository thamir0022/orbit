import { SprintListItemOutput } from '../../contracts/sprint-list-item.output'

/**
 * Output returned after successfully creating a sprint.
 */
export interface CreateSprintOutput {
  sprint: SprintListItemOutput
}
