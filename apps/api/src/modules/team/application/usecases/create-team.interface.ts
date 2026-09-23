import { CreateTeamInput, CreateTeamOutput } from '../dtos'

export interface ICreateTeamUseCase {
  execute(input: CreateTeamInput): Promise<CreateTeamOutput>
}

export const CREATE_TEAM = Symbol('ICreateTeamUseCase')
