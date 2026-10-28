import type { TeamStoryContextInput } from '../../services/team-story-context.service'

export interface DeleteTeamStoryInput extends TeamStoryContextInput {
  readonly key: string
}
