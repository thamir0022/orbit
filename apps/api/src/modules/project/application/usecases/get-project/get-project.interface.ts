import { GetProjectInput } from './get-project.input'
import { GetProjectOutput } from './get-project.output'

/**
 * Contract for retrieving a single project.
 */
export interface IGetProjectUseCase {
  execute(input: GetProjectInput): Promise<GetProjectOutput>
}

export const GET_PROJECT_USE_CASE = Symbol('GetProjectUseCase')
