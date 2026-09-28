import { GetSprintInput } from './get-sprint.input'
import { GetSprintOutput } from './get-sprint.output'

/**
 * Application contract for retrieving a single sprint.
 */
export interface IGetSprintUseCase {
  execute(input: GetSprintInput): Promise<GetSprintOutput>
}

export const GET_SPRINT_USE_CASE = Symbol('GetSprintUseCase')
