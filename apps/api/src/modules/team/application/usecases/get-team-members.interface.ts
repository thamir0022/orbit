import { GetTeamMembersInput, GetTeamMembersOutput } from '../dtos'

export interface IGetTeamMembersUseCase {
  execute(input: GetTeamMembersInput): Promise<GetTeamMembersOutput>
}

export const GET_TEAM_MEMBERS = Symbol('IGetTeamMembersUseCase')
