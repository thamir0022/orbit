import {
  PasswordResetVerifyInputDto,
  PasswordResetVerifyOutputDto,
} from '../dto'

export interface IPasswordResetVerifyUseCase {
  execute(
    input: PasswordResetVerifyInputDto
  ): Promise<PasswordResetVerifyOutputDto>
}

export const PASSWORD_RESET_VERIFY = Symbol('IPasswordResetVerifyUseCase')
