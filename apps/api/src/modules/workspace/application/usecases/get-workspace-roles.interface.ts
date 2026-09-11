import { GetWorkspaceRolesInput, GetWorkspaceRolesOutput } from '../dtos'

export interface IGetWorkspaceRoles {
  execute(input: GetWorkspaceRolesInput): Promise<GetWorkspaceRolesOutput>
}

export const GET_WORKSPACE_ROLES = Symbol('IGetWorkspaceRoles')
