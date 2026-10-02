import { WorkItemListItemOutput } from '../../contracts/work-item-list-item.output'

/**
 * Output returned by the Update Work Item use case.
 */
export interface UpdateWorkItemOutput {
  readonly workItem: WorkItemListItemOutput
}
