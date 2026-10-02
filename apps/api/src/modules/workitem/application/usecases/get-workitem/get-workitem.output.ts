import { WorkItemListItemOutput } from '../../contracts/work-item-list-item.output'

/**
 * Output returned by the Get Work Item use case.
 */
export interface GetWorkItemOutput {
  readonly workItem: WorkItemListItemOutput
}
