import { CreateProjectInput } from './create-project.input'
import { CreateProjectOutput } from './create-project.output'

export interface ICreateProjectUseCase {
  execute(input: CreateProjectInput): Promise<CreateProjectOutput>
}

export const CREATE_PROJECT_USE_CASE = Symbol('CreateProjectUseCase')
