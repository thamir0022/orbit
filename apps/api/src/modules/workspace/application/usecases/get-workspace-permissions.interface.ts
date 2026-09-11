import { GetWorkspacePermissionOutput } from '../dtos'

export interface IGetWorkspacePermissionsUseCase {
  execute(): Promise<GetWorkspacePermissionOutput>
}

export const GET_WORKSPACE_PERMISSIONS = Symbol(
  'IGetWorkspacePermissionsUseCase'
)
