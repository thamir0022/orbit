import type { GetTeamStoriesInput } from './get-team-stories.input'
import type { GetTeamStoriesOutput } from './get-team-stories.output'

export interface IGetTeamStoriesUseCase {
  execute(input: GetTeamStoriesInput): Promise<GetTeamStoriesOutput>
}

export const GET_TEAM_STORIES_USE_CASE = Symbol('GetTeamStoriesUseCase')
