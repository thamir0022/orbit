import { UpdateTeamInput, UpdateTeamOutput } from '../dtos'

export interface IUpdateTeamUseCase {
  execute(input: UpdateTeamInput): Promise<UpdateTeamOutput>
}

export const UPDATE_TEAM = Symbol('IUpdateTeamUseCase')
