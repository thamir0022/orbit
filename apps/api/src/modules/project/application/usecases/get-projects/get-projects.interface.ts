import { GetProjectsInput } from './get-projects.input'
import { GetProjectsOutput } from './get-projects.output'

export interface IGetProjectsUseCase {
  execute(input: GetProjectsInput): Promise<GetProjectsOutput>
}

export const GET_PROJECTS_USE_CASE = Symbol('GetProjectsUseCase')
