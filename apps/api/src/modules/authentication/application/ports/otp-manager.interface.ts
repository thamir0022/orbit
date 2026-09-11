import { Email } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'

/**
 * Defines the business context for the OTP.
 */
export type OtpContext = 'email-verification' | 'password-reset'

export interface IOtpManager {
  /* --- Core OTP Operations --- */
  saveOtp(context: OtpContext, email: Email, otp: Otp): Promise<void>
  getOtp(context: OtpContext, email: Email): Promise<string | null>
  deleteOtp(context: OtpContext, email: Email): Promise<void>

  /* --- Security Tokens (Post-OTP Verification) --- */
  saveGrantToken(
    context: OtpContext,
    token: string,
    email: Email
  ): Promise<void>
  getGrantTokenEmail(context: OtpContext, token: string): Promise<string | null>
  deleteGrantToken(context: OtpContext, token: string): Promise<void>

  /* --- Rate Limiting & Cooldowns --- */
  setCooldown(context: OtpContext, email: Email): Promise<void>
  isOnCooldown(context: OtpContext, email: Email): Promise<boolean>

  getAttempts(context: OtpContext, email: Email): Promise<number>
  incrementAttempts(context: OtpContext, email: Email): Promise<number>
  resetAttempts(context: OtpContext, email: Email): Promise<void>
}

export const OTP_MANAGER = Symbol('IOtpManager')
