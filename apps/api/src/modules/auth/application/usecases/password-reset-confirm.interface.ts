import { PasswordResetConfirmCommand } from '../dto/password-reset-confirm.command'

export interface IPasswordResetConfirmUseCase {
  execute(command: PasswordResetConfirmCommand): Promise<void>
}

export const PASSWORD_RESET_CONFIRM = Symbol('IPasswordResetConfirmUseCase')
