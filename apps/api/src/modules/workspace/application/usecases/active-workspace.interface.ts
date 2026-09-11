import {
  GetActiveWorkspaceInputDto,
  GetActiveWorkspaceOutputDto,
} from '../dtos'

export interface IGetActiveWorkspace {
  execute(
    input: GetActiveWorkspaceInputDto
  ): Promise<GetActiveWorkspaceOutputDto>
}

export const GET_ACTIVE_WORKSPACE = Symbol('IGetActiveWorkspace')
