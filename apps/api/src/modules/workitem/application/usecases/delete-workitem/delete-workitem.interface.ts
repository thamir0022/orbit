import { DeleteWorkItemInput } from './delete-workitem.input'

/**
 * Defines the application contract for deleting a work item.
 */
export interface IDeleteWorkItemUseCase {
  execute(input: DeleteWorkItemInput): Promise<void>
}

export const DELETE_WORK_ITEM_USE_CASE = Symbol('DeleteWorkItemUseCase')
