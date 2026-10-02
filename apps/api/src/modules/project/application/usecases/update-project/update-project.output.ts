import { ProjectListItemOutput } from '../../contracts/project-list-item.output'

/**
 * Output returned by the Update Project use case.
 */
export interface UpdateProjectOutput {
  readonly project: ProjectListItemOutput
}
