import { SprintActorScope } from '../../services/sprint-context.service'

export interface GetSprintWorkItemsInput extends SprintActorScope {
  page: number
  limit: number
}
