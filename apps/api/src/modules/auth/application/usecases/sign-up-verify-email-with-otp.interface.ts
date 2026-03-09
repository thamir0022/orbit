import {
  SignUpVerifyEmailWithOtpRequestDto,
  SignUpVerifyEmailWithOtpResponseDto,
} from '../dto'

export interface ISignUpVerifyEmailWithOtpUseCase {
  execute(
    dto: SignUpVerifyEmailWithOtpRequestDto
  ): Promise<SignUpVerifyEmailWithOtpResponseDto>
}

export const SIGN_UP_VERIFY_EMAIL = Symbol('ISignUpVerifyEmailWithOtpUseCase')
