import { PasswordResetConfirmRequestDto } from '../dto'

export interface IPasswordResetConfirmUseCase {
  execute(dto: PasswordResetConfirmRequestDto): Promise<void>
}

export const PASSWORD_RESET_CONFIRM = Symbol('IPasswordResetConfirmUseCase')
