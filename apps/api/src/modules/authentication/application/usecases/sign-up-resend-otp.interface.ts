import { SignUpResendOtpInput } from '../dto'

export interface ISignupResendOtpUseCase {
  execute(input: SignUpResendOtpInput): Promise<void>
}

export const SIGN_UP_RESEND_OTP = Symbol('ISignupResendOtpUseCase')
