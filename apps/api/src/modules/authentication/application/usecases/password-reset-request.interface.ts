import { PasswordResetRequestInputDto } from '../dto'

export interface IPasswordResetRequestUseCase {
  execute(input: PasswordResetRequestInputDto): Promise<void>
}

export const PASSWORD_RESET_REQUEST = Symbol('IPasswordResetRequestUseCase')
