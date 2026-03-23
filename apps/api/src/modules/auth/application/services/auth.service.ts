import { Inject } from '@nestjs/common'
import {
  CreateSignUpSession,
  type ISessionManager,
  Session,
  SESSION_MANAGER,
  SignUpSessionData,
  UpdateSession,
  UpdateSignUpSessionData,
} from '../repositories/session-manager.interface'
import {
  AccessTokenPayload,
  AccessTokenResult,
  CreateAuthSessionPayload,
  EmailVerifyMailData,
  IAuthService,
  RefreshTokenPayload,
  RefreshTokenResult,
} from './auth.service.interface'
import {
  type ITokenGenerator,
  TOKEN_GENERATOR,
} from '../repositories/token-generator.interface'
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../repositories/password-hasher.interface'
import { Email, Password } from '@/modules/user/domain'
import { InvalidRefreshTokenException } from '../../domain/exceptions/auth.exception'
import { Otp } from '../../domain/value-objects/otp.vo'
import {
  type IOtpManager,
  OTP_MANAGER,
} from '../repositories/otp-manager.interface'
import {
  type IMailService,
  MAIL_SERVICE,
} from '@/modules/mail/domain/ports/mail-service.port'
import { UuidUtil } from '@/shared/utils'
import { addSeconds } from 'date-fns'
import {
  type IJwtConfig,
  JWT_CONFIG,
} from '../../infrastructure/interfaces/jwt.config.interface'
import { REDIS_CONFIG, type IRedisConfig } from '@/shared/infrastructure'

export class AuthService implements IAuthService {
  constructor(
    @Inject(SESSION_MANAGER)
    private readonly _sessionManager: ISessionManager,
    @Inject(TOKEN_GENERATOR)
    private readonly _tokenGenerator: ITokenGenerator,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
    @Inject(OTP_MANAGER)
    private readonly _otpManager: IOtpManager,
    @Inject(MAIL_SERVICE)
    private readonly _mailService: IMailService,
    @Inject(JWT_CONFIG)
    private readonly _jwtConfig: IJwtConfig,
    @Inject(REDIS_CONFIG)
    private readonly _redisConfig: IRedisConfig
  ) {}

  async createAuthSession(payload: CreateAuthSessionPayload): Promise<string> {
    return await this._sessionManager.createAuthSession({
      userId: payload.userId.value,
      email: payload.email.value,
      jti: payload.jti,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    })
  }

  async getAuthSession(sessionId: string): Promise<Session | null> {
    return await this._sessionManager.getAuthSession(sessionId)
  }

  async extendAuthSession(
    sessionId: string,
    updates: UpdateSession
  ): Promise<void> {
    await this._sessionManager.extendAuthSession(
      sessionId,
      updates,
      this.calculateAuthSessionExpiry()
    )
  }

  async invalidateAuthSession(sessionId: string): Promise<void> {
    await this._sessionManager.invalidateAuthSession(sessionId)
  }

  async createRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return await this._tokenGenerator.generateRefreshToken({
      jti: payload.jti,
      sid: payload.sid,
      sub: payload.sub,
    })
  }

  async createAccessToken(payload: AccessTokenPayload): Promise<string> {
    return await this._tokenGenerator.generateAccessToken({
      jti: payload.jti,
      sid: payload.sid,
      sub: payload.sub,
      email: payload.email,
    })
  }

  async verifyAccessToken(token: string): Promise<AccessTokenResult | null> {
    return await this._tokenGenerator.verifyAccessToken(token)
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenResult | null> {
    return await this._tokenGenerator.verifyRefreshToken(token)
  }

  decodeAccessToken(token: string): AccessTokenResult | null {
    return this._tokenGenerator.decodeAccessToken(token)
  }

  decodeRefreshToken(token: string): RefreshTokenResult | null {
    return this._tokenGenerator.decodeRefreshToken(token)
  }

  extractRefreshTokenExpiry(token: string): Date {
    const payload = this.decodeRefreshToken(token)

    if (!payload || typeof payload.exp !== 'number') {
      throw new InvalidRefreshTokenException(
        'Invalid refresh token: missing exp claim'
      )
    }

    return new Date(payload.exp * 1000)
  }

  extractAccessTokenExpiry(token: string): Date {
    const payload = this.decodeAccessToken(token)

    if (!payload || typeof payload.exp !== 'number') {
      throw new InvalidRefreshTokenException(
        'Invalid access token: missing exp claim'
      )
    }

    return new Date(payload.exp * 1000)
  }

  async hashPassword(password: Password): Promise<string> {
    return await this._passwordHasher.hash(password)
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await this._passwordHasher.compare(plainPassword, hashedPassword)
  }

  generateOtp(): Otp {
    return Otp.generate()
  }

  async setEmailVerificationOtp(email: Email, otp: Otp): Promise<void> {
    await this._otpManager.setEmailVerifyOtp(email, otp)
  }

  async getEmailVerificationOtp(
    email: Email
  ): Promise<string | null | undefined> {
    return await this._otpManager.getEmailVerifyOtp(email)
  }

  async deleteEmailVerificationOtp(email: Email): Promise<void> {
    await this._otpManager.deleteEmailVerifyOtp(email)
  }

  async setPasswordResetOtp(email: Email, otp: Otp): Promise<void> {
    await this._otpManager.setPasswordResetOtp(email, otp)
  }

  async getPasswordResetOtp(email: Email): Promise<string | null | undefined> {
    return await this._otpManager.getPasswordResetOtp(email)
  }

  async deletePasswordResetOtp(email: Email): Promise<void> {
    await this._otpManager.deletePasswordResetOtp(email)
  }

  async setPasswordResetToken(token: string, email: Email): Promise<void> {
    await this._otpManager.setPasswordResetToken(token, email)
  }

  async getPasswordResetToken(
    token: string
  ): Promise<string | null | undefined> {
    return this._otpManager.getPasswordResetToken(token)
  }

  generatePasswordResetToken(): string {
    return UuidUtil.generate()
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this._otpManager.detelePasswordResetToken(token)
  }

  async getPasswordResetAttempts(
    email: Email
  ): Promise<number | null | undefined> {
    return await this._otpManager.getPasswordResetAttempts(email.value)
  }

  async setPasswordResetAttempts(
    email: Email,
    attempts: number
  ): Promise<void> {
    await this._otpManager.setPasswordResetAttempts(email.value, attempts)
  }

  async deletePasswordResetAttempt(email: Email): Promise<void> {
    await this._otpManager.deletePasswordResetAttempt(email.value)
  }

  async getPasswordResetCooldown(
    email: Email
  ): Promise<string | null | undefined> {
    return await this._otpManager.getPasswordResetCooldown(email.value)
  }

  async setPasswordResetCooldown(email: Email): Promise<void> {
    await this._otpManager.setPasswordResetCooldown(email.value)
  }

  async deletePasswordResetCooldown(email: Email): Promise<void> {
    await this._otpManager.deletePasswordResetCooldown(email.value)
  }

  hasExceededOtpAttempts(attempts: number | null | undefined): boolean {
    const safeAttempts = attempts ?? 0
    return safeAttempts >= this._redisConfig.maxOtpPerDay
  }

  async sendEmailVerificationEmail(data: EmailVerifyMailData): Promise<void> {
    await this._mailService.sendEmailVerificationEmail(
      data.email.value.toString(),
      data.otp.value.toString()
    )
  }

  async sendForgotPasswordEmail(email: Email, otp: Otp): Promise<void> {
    await this._mailService.sendForgotPasswordEmail(
      email.value.toString(),
      otp.value.toString()
    )
  }

  createRegistrationToken(): string {
    return UuidUtil.generate()
  }

  createRefreshTokenId(): string {
    return UuidUtil.generate()
  }

  createAccessTokenId(): string {
    return UuidUtil.generate()
  }

  async createSignUpSession(
    registrationToken: string,
    data: CreateSignUpSession
  ): Promise<void> {
    await this._sessionManager.createSignUpSession(registrationToken, data)
  }

  async getSignUpSession(
    token: string
  ): Promise<SignUpSessionData | null | undefined> {
    return this._sessionManager.getSignUpSession(token)
  }

  async updateSignUpSession(
    token: string,
    updates: UpdateSignUpSessionData
  ): Promise<void> {
    await this._sessionManager.updateSignUpSession(token, updates)
  }

  async deleteSignUpSession(token: string): Promise<void> {
    await this._sessionManager.deleteSignUpSession(token)
  }

  createRedirectUrl(subdomain: string): string {
    return `http://${subdomain}.localhost:3000/dashboard` // TODO: Make it dynamic, handle dev and prod envs
  }

  private calculateAuthSessionExpiry() {
    return addSeconds(new Date(), this._jwtConfig.refreshTokenExpiresIn)
  }
}
