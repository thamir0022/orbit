import { UpdateProjectInput } from './update-project.input'
import { UpdateProjectOutput } from './update-project.output'

/**
 * Contract for updating a project.
 */
export interface IUpdateProjectUseCase {
  execute(input: UpdateProjectInput): Promise<UpdateProjectOutput>
}

export const UPDATE_PROJECT_USE_CASE = Symbol('UpdateProjectUseCase')
