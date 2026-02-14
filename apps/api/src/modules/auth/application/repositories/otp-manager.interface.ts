import { Email } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'

export interface OtpData {
  otp: Otp
  email: Email
}

export interface OtpTokenData {
  resetToken: string
  email: Email
}

export interface IOtpManager {
  setOtp(data: OtpData): Promise<void>
  getOtp(email: Email): Promise<string | null | undefined>
  deleteOtp(email: Email): Promise<void>
  setResetOtpToken(data: OtpTokenData): Promise<void>
  getResetOtpToken(token: string): Promise<string | null | undefined>
  deteleResetOtpToken(token: string): Promise<void>
}

export const OTP_MANAGER = Symbol('IOtpManager')
