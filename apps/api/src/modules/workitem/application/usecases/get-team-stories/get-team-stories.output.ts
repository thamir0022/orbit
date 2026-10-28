import type { WorkItemListItemOutput } from '../../contracts/work-item-list-item.output'

export interface GetTeamStoriesOutput {
  readonly items: readonly WorkItemListItemOutput[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly hasNextPage: boolean
}
