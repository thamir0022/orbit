import { GetWorkspaceMemberInput, GetWorkspaceMemberOutput } from '../dtos'

export interface IGetWorkspaceMemberUseCase {
  execute(input: GetWorkspaceMemberInput): Promise<GetWorkspaceMemberOutput>
}

export const GET_WORKSPACE_MEMBER = Symbol('IGetWorkspaceMemberUseCase')
