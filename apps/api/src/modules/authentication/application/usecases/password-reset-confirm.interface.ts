import { PasswordResetConfirmInputDto } from '../dto'

export interface IPasswordResetConfirmUseCase {
  execute(input: PasswordResetConfirmInputDto): Promise<void>
}

export const PASSWORD_RESET_CONFIRM = Symbol('IPasswordResetConfirmUseCase')
