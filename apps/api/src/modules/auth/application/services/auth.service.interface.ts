import { Email, Password, UserId } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'
import {
  CreateSignUpSession,
  Session,
  SignUpSessionData,
  UpdateSession,
  UpdateSignUpSessionData,
} from '../repositories/session-manager.interface'

export interface CreateAuthSessionPayload {
  userId: UserId
  jti: string
  email: Email
  ipAddress: string
  userAgent: string
}

export interface RefreshTokenPayload {
  jti: string
  sub: string
  sid: string
}

export interface AccessTokenPayload {
  jti: string
  email: string
  sub: string
  sid: string
}

interface JwtStandardClaims {
  iat: number
  exp: number
}

export type WithJwtMeta<T> = T & JwtStandardClaims

export type AccessTokenResult = WithJwtMeta<AccessTokenPayload>
export type RefreshTokenResult = WithJwtMeta<RefreshTokenPayload>

export type EmailVerifyOtpData = { email: Email; otp: Otp }

export type EmailVerifyMailData = { email: Email; otp: Otp }

export interface IAuthService {
  createAuthSession(payload: CreateAuthSessionPayload): Promise<string>
  getAuthSession(sessionId: string): Promise<Session | null>
  extendAuthSession(sessionId: string, updates: UpdateSession): Promise<void>
  invalidateAuthSession(sessionId: string): Promise<void>
  createAccessToken(payload: AccessTokenPayload): Promise<string>
  createRefreshToken(payload: RefreshTokenPayload): Promise<string>
  decodeAccessToken(token: string): AccessTokenResult | null
  decodeRefreshToken(token: string): RefreshTokenResult | null
  verifyAccessToken(token: string): Promise<AccessTokenResult | null>
  verifyRefreshToken(token: string): Promise<RefreshTokenResult | null>
  extractRefreshTokenExpiry(token: string): Date
  extractAccessTokenExpiry(token: string): Date
  hashPassword(password: Password): Promise<string>
  comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean>
  generateOtp(): Otp
  generatePasswordResetToken(): string
  setPasswordResetToken(token: string, email: Email): Promise<void>
  getPasswordResetToken(token: string): Promise<string | null | undefined>
  deletePasswordResetToken(token: string): Promise<void>
  setEmailVerificationOtp(email: Email, otp: Otp): Promise<void>
  getEmailVerificationOtp(email: Email): Promise<string | null | undefined>
  deleteEmailVerificationOtp(email: Email): Promise<void>
  setPasswordResetOtp(email: Email, otp: Otp): Promise<void>
  getPasswordResetOtp(email: Email): Promise<string | null | undefined>
  deletePasswordResetOtp(email: Email): Promise<void>
  getPasswordResetCooldown(email: Email): Promise<string | null | undefined>
  setPasswordResetCooldown(email: Email): Promise<void>
  deletePasswordResetCooldown(email: Email): Promise<void>
  setPasswordResetAttempts(email: Email, attempts: number): Promise<void>
  getPasswordResetAttempts(email: Email): Promise<number | null | undefined>
  deletePasswordResetAttempt(email: Email): Promise<void>
  hasExceededOtpAttempts(attempts: number | undefined | null): boolean
  createRegistrationToken(): string
  createRefreshTokenId(): string
  createAccessTokenId(): string
  createSignUpSession(
    registrationToken: string,
    data: CreateSignUpSession
  ): Promise<void>
  getSignUpSession(token: string): Promise<SignUpSessionData | null | undefined>
  updateSignUpSession(
    token: string,
    updates: UpdateSignUpSessionData
  ): Promise<void>
  deleteSignUpSession(token: string): Promise<void>
  sendEmailVerificationEmail(data: EmailVerifyMailData): Promise<void>
  sendForgotPasswordEmail(email: Email, otp: Otp): Promise<void>
  createRedirectUrl(subdomain: string): string
}

export const AUTH_SERVICE = Symbol('IAuthService')
