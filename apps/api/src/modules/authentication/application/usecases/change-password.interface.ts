import { ChangePasswordInput } from '../dto'

export interface IChangePasswordUseCase {
  execute(input: ChangePasswordInput): Promise<void>
}

export const CHANGE_PASSWORD = Symbol('IChangePasswordUseCase')
