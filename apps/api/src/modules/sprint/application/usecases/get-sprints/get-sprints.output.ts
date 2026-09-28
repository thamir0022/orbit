import { SprintListItemOutput } from '../../contracts/sprint-list-item.output'

/**
 * Output returned by the Get Sprints use case.
 */
export interface GetSprintsOutput {
  readonly sprints: SprintListItemOutput[]

  readonly total: number

  readonly page: number

  readonly limit: number

  readonly hasNextPage: boolean
}
