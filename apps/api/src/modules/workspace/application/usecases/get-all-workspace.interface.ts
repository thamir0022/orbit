import { GetAllWorkspacesInput } from '../dtos'
import { GetAllWorkspaceOutput } from '../dtos'

export interface IGetAllWorkspaceUseCase {
  execute(input: GetAllWorkspacesInput): Promise<GetAllWorkspaceOutput>
}

export const GET_ALL_WORKSPACES = Symbol('GET_ALL_WORKSPACES')
