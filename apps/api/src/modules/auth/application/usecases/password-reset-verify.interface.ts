import { PasswordResetVerifyCommand } from '../dto/password-reset-verify.command'
import { PasswordResetVerifyResult } from '../dto/password-reset-verify.result'

export interface IPasswordResetVerifyUseCase {
  execute(
    command: PasswordResetVerifyCommand
  ): Promise<PasswordResetVerifyResult>
}

export const PASSWORD_RESET_VERIFY = Symbol('IPasswordResetVerifyUseCase')
