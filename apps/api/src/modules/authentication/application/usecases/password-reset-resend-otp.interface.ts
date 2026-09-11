import { PasswordResetResendOtpInputDto } from '../dto'

export interface IPasswordResetResendOtpUseCase {
  execute(input: PasswordResetResendOtpInputDto): Promise<void>
}

export const PASSWORD_RESET_RESEND_OTP = Symbol(
  'IPasswordResetResendOtpUseCase'
)
