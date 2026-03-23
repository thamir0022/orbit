import { PasswordResetResendOtpRequestDto } from '../dto'

export interface IPasswordResetResendOtpUseCase {
  execute(dto: PasswordResetResendOtpRequestDto): Promise<void>
}

export const PASSWORD_RESET_RESEND_OTP = Symbol(
  'IPasswordResetResendOtpUseCase'
)
