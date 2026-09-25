import { RemoveTeamMemberInput } from '../dtos'

export interface IRemoveTeamMemberUseCase {
  execute(input: RemoveTeamMemberInput): Promise<void>
}

export const REMOVE_TEAM_MEMBER = Symbol('IRemoveTeamMemberUseCase')
