import { PasswordResetRequestCommand } from '../dto/password-reset-request.command'

export interface IPasswordResetRequestUseCase {
  execute(command: PasswordResetRequestCommand): Promise<void>
}

export const PASSWORD_RESET_REQUEST = Symbol('IPasswordResetRequestUseCase')
