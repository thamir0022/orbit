import { CreateWorkspaceInput, CreateWorkspaceOutput } from '../dtos'

export interface ICreateWorkspaceUseCase {
  execute(input: CreateWorkspaceInput): Promise<CreateWorkspaceOutput>
}

export const CREATE_WORKSPACE = Symbol('CREATE_WORKSPACE')
