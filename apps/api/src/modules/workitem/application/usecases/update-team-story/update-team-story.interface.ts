import type { UpdateTeamStoryInput } from './update-team-story.input'
import type { UpdateWorkItemOutput } from '../update-workitem/update-workitem.output'

export interface IUpdateTeamStoryUseCase {
  execute(input: UpdateTeamStoryInput): Promise<UpdateWorkItemOutput>
}

export const UPDATE_TEAM_STORY_USE_CASE = Symbol('UpdateTeamStoryUseCase')
