import type { DeleteTeamStoryInput } from './delete-team-story.input'

export interface IDeleteTeamStoryUseCase {
  execute(input: DeleteTeamStoryInput): Promise<void>
}

export const DELETE_TEAM_STORY_USE_CASE = Symbol('DeleteTeamStoryUseCase')
