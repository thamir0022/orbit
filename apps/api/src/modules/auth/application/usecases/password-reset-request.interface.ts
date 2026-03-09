import { PasswordResetRequestDto } from '../dto'

export interface IPasswordResetRequestUseCase {
  execute(dto: PasswordResetRequestDto): Promise<void>
}

export const PASSWORD_RESET_REQUEST = Symbol('IPasswordResetRequestUseCase')
