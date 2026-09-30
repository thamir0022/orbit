import { WorkItemListItemOutput } from '../../contracts/work-item-list-item.output'

/**
 * Result returned after successfully creating a work item.
 */
export interface CreateWorkItemOutput {
  readonly workItem: WorkItemListItemOutput
}
