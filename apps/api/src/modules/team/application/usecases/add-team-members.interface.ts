import { AddTeamMembersInput, AddTeamMembersOutput } from '../dtos'

export interface IAddTeamMembersUseCase {
  execute(input: AddTeamMembersInput): Promise<AddTeamMembersOutput>
}

export const ADD_TEAM_MEMBERS = Symbol('IAddTeamMembersUseCase')
