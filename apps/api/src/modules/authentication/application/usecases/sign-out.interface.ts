import { SignOutInputDto } from '../dto'

export interface ISignOutUseCase {
  execute(input: SignOutInputDto): Promise<void>
}

export const SIGN_OUT = Symbol('ISignOutUseCase')
