import { GetWorkItemInput } from './get-workitem.input'
import { GetWorkItemOutput } from './get-workitem.output'

/**
 * Defines the application contract for retrieving a single work item.
 */
export interface IGetWorkItemUseCase {
  execute(input: GetWorkItemInput): Promise<GetWorkItemOutput>
}

export const GET_WORK_ITEM_USE_CASE = Symbol('GetWorkItemUseCase')
