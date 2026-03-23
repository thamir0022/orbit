import { Email } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'

export interface IOtpManager {
  setEmailVerifyOtp(email: Email, otp: Otp): Promise<void>
  getEmailVerifyOtp(email: Email): Promise<string | null | undefined>
  deleteEmailVerifyOtp(email: Email): Promise<void>
  setPasswordResetOtp(email: Email, otp: Otp): Promise<void>
  getPasswordResetOtp(email: Email): Promise<string | null | undefined>
  deletePasswordResetOtp(email: Email): Promise<void>
  setPasswordResetToken(token: string, email: Email): Promise<void>
  getPasswordResetToken(token: string): Promise<string | null | undefined>
  detelePasswordResetToken(token: string): Promise<void>
  getPasswordResetCooldown(email: string): Promise<string | null | undefined>
  setPasswordResetCooldown(email: string): Promise<void>
  deletePasswordResetCooldown(email: string): Promise<void>
  setPasswordResetAttempts(email: string, attempts: number): Promise<void>
  getPasswordResetAttempts(email: string): Promise<number | null | undefined>
  deletePasswordResetAttempt(email: string): Promise<void>
}

export const OTP_MANAGER = Symbol('IOtpManager')
