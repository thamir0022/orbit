import { WorkItemListItemOutput } from '../../contracts/work-item-list-item.output'

/**
 * Output returned by the Get Work Items use case.
 */
export interface GetWorkItemsOutput {
  readonly workItems: WorkItemListItemOutput[]

  readonly total: number

  readonly page: number

  readonly limit: number

  readonly hasNextPage: boolean
}
