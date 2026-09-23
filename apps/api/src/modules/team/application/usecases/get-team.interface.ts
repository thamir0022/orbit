import { GetTeamInput, GetTeamOutput } from '../dtos'

export interface IGetTeamUseCase {
  execute(input: GetTeamInput): Promise<GetTeamOutput>
}

export const GET_TEAM = Symbol('IGetTeamUseCase')
