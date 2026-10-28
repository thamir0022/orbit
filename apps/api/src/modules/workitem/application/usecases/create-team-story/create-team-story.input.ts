import type { CreateWorkItemInput } from '../create-work-item/create-work-item.input'
import type { TeamStoryContextInput } from '../../services/team-story-context.service'

export interface CreateTeamStoryInput
  extends
    Omit<CreateWorkItemInput, 'teamId' | 'type' | 'sprintId'>,
    TeamStoryContextInput {}
