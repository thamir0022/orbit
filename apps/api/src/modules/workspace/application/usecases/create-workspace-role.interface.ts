import { CreateWorkspaceRoleInput, CreateWorkspaceRoleOutput } from '../dtos'

export interface ICreateWorkspaceRoleUseCase {
  execute(input: CreateWorkspaceRoleInput): Promise<CreateWorkspaceRoleOutput>
}

export const CREATE_WORKSPACE_ROLE = Symbol('ICreateWorkspaceRoleUseCase')
