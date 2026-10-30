import { SprintActorScope } from '../../services/sprint-context.service'

export interface IDeleteSprintUseCase {
  execute(input: SprintActorScope): Promise<void>
}

export const DELETE_SPRINT = Symbol('DeleteSprint')
