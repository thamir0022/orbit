import { GetWorkspaceMembersInput, GetWorkspaceMembersOutput } from '../dtos'

export interface IGetWorkspaceMembersUseCase {
  execute(input: GetWorkspaceMembersInput): Promise<GetWorkspaceMembersOutput>
}

export const GET_WORKSPACE_MEMBERS = Symbol('IGetWorkspaceMembersUseCase')
