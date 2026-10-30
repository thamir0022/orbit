import { GetSprintOutput } from '../get-sprint/get-sprint.output'

// Lifecycle actions are explicit commands, not arbitrary status edits.
export interface TransitionSprintInput {
  workspaceId: string
  teamId: string
  sprintId: string
  actorId: string
  targetSprintId?: string
  reason?: string
  action: 'start' | 'complete' | 'cancel'
}

export interface ITransitionSprintUseCase {
  execute(input: TransitionSprintInput): Promise<GetSprintOutput>
}

export const TRANSITION_SPRINT_USE_CASE = Symbol('TransitionSprintUseCase')
