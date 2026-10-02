import { DeleteProjectInput } from './delete-project.input'

/**
 * Contract for soft-deleting a project.
 */
export interface IDeleteProjectUseCase {
  execute(input: DeleteProjectInput): Promise<void>
}

export const DELETE_PROJECT_USE_CASE = Symbol('DeleteProjectUseCase')
