import { GetUserWorkspaceInputDto, GetUserWorkspaceOutputDto } from '../dtos'

export interface IGetUserWorkspacesUseCase {
  execute(params: GetUserWorkspaceInputDto): Promise<GetUserWorkspaceOutputDto>
}

export const GET_USER_WORKSPACES = Symbol('IGetUserWorkspacesUseCase')
