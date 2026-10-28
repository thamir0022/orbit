import type { UpdateWorkItemInput } from '../update-workitem/update-workitem.input'
import type { TeamStoryContextInput } from '../../services/team-story-context.service'

export interface UpdateTeamStoryInput
  extends
    Omit<UpdateWorkItemInput, 'type' | 'sprintId'>,
    TeamStoryContextInput {}
