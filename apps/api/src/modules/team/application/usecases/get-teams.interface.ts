import { GetTeamsInput, GetTeamsOutput } from '../dtos'

export interface IGetTeamsUseCase {
  execute(input: GetTeamsInput): Promise<GetTeamsOutput>
}

export const GET_TEAMS = Symbol('IGetTeamsUseCase')
