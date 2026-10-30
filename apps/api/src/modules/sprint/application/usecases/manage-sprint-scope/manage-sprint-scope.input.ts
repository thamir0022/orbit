import { SprintActorScope } from '../../services/sprint-context.service'

export interface ManageSprintScopeInput extends SprintActorScope {
  workItemId: string
  action: 'assign' | 'remove'
  reason?: string
}
