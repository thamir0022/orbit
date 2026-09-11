import { EditUserInput, EditUserOutput } from '../dto'

export interface IEditUserProfileUseCase {
  execute(input: EditUserInput): Promise<EditUserOutput>
}

export const EDIT_USER_PROFILE_USECASE = Symbol('EDIT_USER_PROFILE_USECASE')
