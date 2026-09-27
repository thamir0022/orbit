import { CreateSprintInput } from './create-sprint.input'
import { CreateSprintOutput } from './create-sprint.output'

/**
 * Application contract for creating a sprint.
 *
 * The interface belongs to the application layer and knows nothing
 * about NestJS, MongoDB, Mongoose, or other infrastructure details.
 */
export interface ICreateSprintUseCase {
  execute(input: CreateSprintInput): Promise<CreateSprintOutput>
}

export const CREATE_SPRINT_USE_CASE = Symbol('CreateSprintUseCase')
