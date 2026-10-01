import { ProjectListItemOutput } from '../../contracts/project-list-item.output'

/**
 * Output returned by the Get Projects use case.
 */
export interface GetProjectsOutput {
  readonly projects: ProjectListItemOutput[]

  readonly total: number

  readonly page: number

  readonly limit: number

  readonly hasNextPage: boolean
}
