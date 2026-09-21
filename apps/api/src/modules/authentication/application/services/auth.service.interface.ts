import { Email, Password, UserId } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'
import {
  type RefreshTokenPayload,
  type AccessTokenPayload,
  type RefreshTokenResult,
  type AccessTokenResult,
} from '../../../../shared/application/ports/token-generator.interface'
import { SessionData } from '../ports/session-manager.interface'
import { type OnboardingState } from '../ports/onboarding-cache.interface'
import { type OtpContext } from '../ports/otp-manager.interface'
import { JwtSignOptions } from '@nestjs/jwt'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

export interface CreateSessionPayload {
  userId: UserId
  jti: string // JWT ID of the Refresh Token
  email: Email
  ipAddress: string
  userAgent: string
}

export interface InitializeOnboardingFlowPayload {
  registrationToken: string
  email: Email
}

export interface IAuthService {
  /* -------------------------------------------------------------------------- */
  /* Global Identity Session Management                                         */
  /* -------------------------------------------------------------------------- */
  createSession(payload: CreateSessionPayload): Promise<string>
  getAllUserSession(userId: string): Promise<SessionData[] | null>
  getSession(sessionId: string): Promise<SessionData | null>
  extendSession(sessionId: string, newExpiresAt: Date): Promise<void>
  revokeSession(sessionId: string): Promise<void>
  revokeAllUserSessions(userId: UserId): Promise<void>
  touchSession(sessionId: string): Promise<void>

  /* -------------------------------------------------------------------------- */
  /* Multi-Tenant Token Generation & Validation                                 */
  /* -------------------------------------------------------------------------- */
  createRefreshToken(
    payload: RefreshTokenPayload,
    options?: JwtSignOptions
  ): Promise<string>
  createAccessToken(
    payload: AccessTokenPayload,
    options?: JwtSignOptions
  ): Promise<string>

  verifyRefreshToken(token: string): Promise<RefreshTokenResult | null>
  verifyAccessToken(token: string): Promise<AccessTokenResult | null>

  decodeRefreshToken(token: string): RefreshTokenResult | null
  decodeAccessToken(token: string): AccessTokenResult | null

  extractTokenExpiry(token: string): Date

  /* -------------------------------------------------------------------------- */
  /* Dynamic OTP & Security Tokens (Using OtpContext)                           */
  /* -------------------------------------------------------------------------- */
  generateOtp(): Otp
  saveOtp(context: OtpContext, email: Email, otp: Otp): Promise<void>
  getOtp(context: OtpContext, email: Email): Promise<string | null>
  deleteOtp(context: OtpContext, email: Email): Promise<void>

  generateSecureToken(): string
  saveGrantToken(
    context: OtpContext,
    token: string,
    email: Email
  ): Promise<void>
  getGrantTokenEmail(context: OtpContext, token: string): Promise<string | null>
  deleteGrantToken(context: OtpContext, token: string): Promise<void>

  /* -------------------------------------------------------------------------- */
  /* Rate Limiting & Cooldowns                                                  */
  /* -------------------------------------------------------------------------- */
  setOtpCooldown(context: OtpContext, email: Email): Promise<void>
  isOtpOnCooldown(context: OtpContext, email: Email): Promise<boolean>

  getOtpAttempts(context: OtpContext, email: Email): Promise<number>
  incrementOtpAttempts(context: OtpContext, email: Email): Promise<number>
  resetOtpAttempts(context: OtpContext, email: Email): Promise<void>
  hasExceededOtpAttempts(attempts: number): boolean

  /* -------------------------------------------------------------------------- */
  /* Multi-Step Onboarding Cache                                                */
  /* -------------------------------------------------------------------------- */
  initializeOnboardingFlow(
    payload: InitializeOnboardingFlowPayload
  ): Promise<void>
  getOnboardingState(registrationToken: string): Promise<OnboardingState | null>
  updateOnboardingState(
    registrationToken: string,
    updates: Partial<Omit<OnboardingState, 'email'>>
  ): Promise<void>
  completeOnboardingFlow(registrationToken: string): Promise<void>

  /* -------------------------------------------------------------------------- */
  /* Email Communications                                                       */
  /* -------------------------------------------------------------------------- */
  sendEmailVerificationEmail(email: Email, otp: Otp): Promise<void>
  sendForgotPasswordEmail(email: Email, otp: Otp): Promise<void>

  /* -------------------------------------------------------------------------- */
  /* Cryptography & Utils                                                       */
  /* -------------------------------------------------------------------------- */
  hashPassword(password: Password): Promise<string>
  comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean>

  // Permission cache

  cachePermissions(roleId: string, permissions: string[]): Promise<void>

  // Role

  isPlatformAdmin(userId: string): Promise<boolean>
  isSystemUser(userId: string): Promise<boolean>
  getWorkspaceAdminRoleId(): Promise<RoleId>
}

export const AUTH_SERVICE = Symbol('IAuthService')
