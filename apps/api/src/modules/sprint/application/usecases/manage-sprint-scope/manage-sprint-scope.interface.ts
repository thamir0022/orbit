import { SprintWorkItem } from '../../../domain/entities/sprint-work-item.entity'
import { ManageSprintScopeInput } from './manage-sprint-scope.input'

export interface IManageSprintScopeUseCase {
  execute(
    input: ManageSprintScopeInput
  ): Promise<{ assignment: ReturnType<SprintWorkItem['toSnapshot']> | null }>
}

export const MANAGE_SPRINT_SCOPE = Symbol('ManageSprintScope')
