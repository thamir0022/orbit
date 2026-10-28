import type { CreateTeamStoryInput } from './create-team-story.input'
import type { CreateWorkItemOutput } from '../create-work-item/create-work-item.output'

export interface ICreateTeamStoryUseCase {
  execute(input: CreateTeamStoryInput): Promise<CreateWorkItemOutput>
}

export const CREATE_TEAM_STORY_USE_CASE = Symbol('CreateTeamStoryUseCase')
