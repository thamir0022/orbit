import { ChangePasswordInput, ChangePasswordOutputDto } from '../dto'

export interface IChangePasswordUseCase {
  execute(input: ChangePasswordInput): Promise<ChangePasswordOutputDto>
}

export const CHANGE_PASSWORD = Symbol('IChangePasswordUseCase')
