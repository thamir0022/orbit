import { DeleteTeamInput } from '../dtos'

export interface IDeleteTeamUseCase {
  execute(input: DeleteTeamInput): Promise<void>
}

export const DELETE_TEAM = Symbol('IDeleteTeamUseCase')
