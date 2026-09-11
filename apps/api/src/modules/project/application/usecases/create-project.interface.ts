import { CreateProjectInput, CreateProjectOutput } from '../dtos'

export interface ICreateProjectUseCase {
  execute(input: CreateProjectInput): Promise<CreateProjectOutput>
}

export const CREATE_PROJECT = Symbol('ICreateProjectUseCase')
