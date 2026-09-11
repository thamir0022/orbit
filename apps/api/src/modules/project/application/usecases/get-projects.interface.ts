import { GetProjectsInput, GetProjectsOutput } from '../dtos'

export interface IGetProjectsUseCase {
  execute(input: GetProjectsInput): Promise<GetProjectsOutput>
}

export const GET_PROJECTS = Symbol('IGetProjectsUseCase')
