import { UpdateSprintInput } from './update-sprint.input'
import { UpdateSprintOutput } from './update-sprint.output'

/**
 * Application contract for updating a sprint.
 */
export interface IUpdateSprintUseCase {
  execute(input: UpdateSprintInput): Promise<UpdateSprintOutput>
}

export const UPDATE_SPRINT_USE_CASE = Symbol('UpdateSprintUseCase')
