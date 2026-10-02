import { GetWorkItemsInput } from './get-workitems.input'
import { GetWorkItemsOutput } from './get-workitems.output'

/**
 * Defines the application contract for retrieving work items.
 */
export interface IGetWorkItemsUseCase {
  execute(input: GetWorkItemsInput): Promise<GetWorkItemsOutput>
}

export const GET_WORK_ITEMS_USE_CASE = Symbol('GetWorkItemsUseCase')
