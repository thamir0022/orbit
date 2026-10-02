import { UpdateWorkItemInput } from './update-workitem.input'
import { UpdateWorkItemOutput } from './update-workitem.output'

/**
 * Defines the application contract for updating a work item.
 */
export interface IUpdateWorkItemUseCase {
  execute(input: UpdateWorkItemInput): Promise<UpdateWorkItemOutput>
}

export const UPDATE_WORK_ITEM_USE_CASE = Symbol('UpdateWorkItemUseCase')
