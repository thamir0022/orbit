import { DeleteWorkspaceRoleInput } from '../dtos'

export interface IDeleteWorkspaceRoleUseCase {
  execute(input: DeleteWorkspaceRoleInput): Promise<void>
}

export const DELETE_WORKSPACE_ROLE = Symbol('IDeleteWorkspaceRoleUseCase')
