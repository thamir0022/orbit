import { CompleteRegistrationInput, CompleteRegistrationOutput } from '../dto'

export interface ICompleteRegistrationUseCase {
  execute(input: CompleteRegistrationInput): Promise<CompleteRegistrationOutput>
}

export const COMPLETE_REGISTRATION = Symbol('ICompleteRegistrationUseCase')
