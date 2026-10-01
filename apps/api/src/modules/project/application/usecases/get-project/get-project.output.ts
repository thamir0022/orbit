import { ProjectListItemOutput } from '../../contracts/project-list-item.output'

/**
 * Output returned by the Get Project use case.
 */
export interface GetProjectOutput {
  readonly project: ProjectListItemOutput
}
