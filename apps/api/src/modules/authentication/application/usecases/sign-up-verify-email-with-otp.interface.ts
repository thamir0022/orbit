import {
  SignUpVerifyEmailWithOtpInputDto,
  SignUpVerifyEmailWithOtpOutputDto,
} from '../dto'

export interface ISignUpVerifyEmailWithOtpUseCase {
  execute(
    input: SignUpVerifyEmailWithOtpInputDto
  ): Promise<SignUpVerifyEmailWithOtpOutputDto>
}

export const SIGN_UP_VERIFY_EMAIL = Symbol('ISignUpVerifyEmailWithOtpUseCase')
