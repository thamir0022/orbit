import { SprintWorkItemProps } from '../../../domain/interfaces/sprint-work-item.interface'
import { GetSprintWorkItemsInput } from './get-sprint-work-items.input'

export interface IGetSprintWorkItemsUseCase {
  execute(input: GetSprintWorkItemsInput): Promise<{
    assignments: SprintWorkItemProps[]
    total: number
    page: number
    limit: number
    hasNextPage: boolean
  }>
}
export const GET_SPRINT_WORK_ITEMS = Symbol('GetSprintWorkItems')
