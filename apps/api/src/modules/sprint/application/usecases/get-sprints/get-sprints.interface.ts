import { GetSprintsInput } from './get-sprints.input'
import { GetSprintsOutput } from './get-sprints.output'

/**
 * Application contract for retrieving sprints.
 */
export interface IGetSprintsUseCase {
  execute(input: GetSprintsInput): Promise<GetSprintsOutput>
}

export const GET_SPRINTS_USE_CASE = Symbol('GetSprintsUseCase')
