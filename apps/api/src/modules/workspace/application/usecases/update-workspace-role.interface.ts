import { UpdateWorkspaceRoleInput, UpdateWorkspaceRoleOutput } from '../dtos'

export interface IUpdateWorkspaceRoleUseCase {
  execute(input: UpdateWorkspaceRoleInput): Promise<UpdateWorkspaceRoleOutput>
}

export const UPDATE_WORKSPACE_ROLE = Symbol('IUpdateWorkspaceRoleUseCase')
