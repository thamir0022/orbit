import {
  PasswordResetVerifyRequestDto,
  PasswordResetVerifyResponseDto,
} from '../dto'

export interface IPasswordResetVerifyUseCase {
  execute(
    dto: PasswordResetVerifyRequestDto
  ): Promise<PasswordResetVerifyResponseDto>
}

export const PASSWORD_RESET_VERIFY = Symbol('IPasswordResetVerifyUseCase')
