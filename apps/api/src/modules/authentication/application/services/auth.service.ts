import { Inject, Injectable } from '@nestjs/common'
import { Email, Password, UserId } from '@/modules/user/domain'
import { UuidUtil } from '@/shared/utils'
import { Otp } from '../../domain/value-objects/otp.vo'

import {
  type IAuthService,
  type CreateSessionPayload,
  InitializeOnboardingFlowPayload,
} from './auth.service.interface'

import {
  type ISessionManager,
  SESSION_MANAGER,
  type SessionData,
} from '../ports/session-manager.interface'

import {
  type ITokenGenerator,
  TOKEN_GENERATOR,
  type RefreshTokenPayload,
  type AccessTokenPayload,
  type RefreshTokenResult,
  type AccessTokenResult,
} from '../../../../shared/application/ports/token-generator.interface'

import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../../../../shared/application/ports/password-hasher.interface'

import {
  type IOtpManager,
  OTP_MANAGER,
  type OtpContext,
} from '../ports/otp-manager.interface'

import {
  type IOnboardingCache,
  ONBOARDING_CACHE,
  OnboardingState,
} from '../ports/onboarding-cache.interface'

import {
  type IMailService,
  MAIL_SERVICE,
} from '@/modules/mail/domain/ports/mail-service.port'
import { REDIS_CONFIG, type IRedisConfig } from '@/shared/infrastructure'
import { JwtSignOptions } from '@nestjs/jwt'
import {
  USER_ROLE_REPOSITORY,
  type UserRoleRepository,
} from '@/modules/authorization/application/repositories/user-role.repository'
import {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '@/modules/authorization/application/repositories/role.repository'
import { RoleName } from '@/modules/authorization/domain/value-objects/role-name.vo'
import {
  PERMISSION_CACHE_MANAGER,
  type IPermissionCacheManager,
} from '@/modules/authorization/application/repositories/permission-cache-manager.interface'
import { SystemRole } from '@/modules/authorization/domain/enums/system-role.enum'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

export interface IAuthRedirectConfig {
  rootDomain: string
  protocol: 'http' | 'https'
  dashboardPath?: string
}

type PayloadWithExp = { exp?: number | null } | null

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(SESSION_MANAGER)
    private readonly sessionManager: ISessionManager,

    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: ITokenGenerator,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,

    @Inject(OTP_MANAGER)
    private readonly otpManager: IOtpManager,

    @Inject(ONBOARDING_CACHE)
    private readonly onboardingCache: IOnboardingCache,

    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService,

    @Inject(REDIS_CONFIG)
    private readonly redisConfig: IRedisConfig,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepository: UserRoleRepository,

    @Inject(PERMISSION_CACHE_MANAGER)
    private readonly permissionCache: IPermissionCacheManager
  ) {}

  async createSession(payload: CreateSessionPayload): Promise<string> {
    return await this.sessionManager.createSession({
      userId: payload.userId.value,
      email: payload.email.value,
      jti: payload.jti,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    })
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return await this.sessionManager.getSession(sessionId)
  }

  async extendSession(sessionId: string, newExpiresAt: Date): Promise<void> {
    await this.sessionManager.extendSession(sessionId, newExpiresAt)
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionManager.revokeSession(sessionId)
  }

  async revokeAllUserSessions(userId: UserId): Promise<void> {
    await this.sessionManager.revokeAllUserSessions(userId.value)
  }

  async createRefreshToken(
    payload: RefreshTokenPayload,
    options?: JwtSignOptions
  ): Promise<string> {
    return this.tokenGenerator.generateRefreshToken(payload, options)
  }

  async createAccessToken(
    payload: AccessTokenPayload,
    options?: JwtSignOptions
  ): Promise<string> {
    return this.tokenGenerator.generateAccessToken(payload, options)
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenResult | null> {
    return this.tokenGenerator.verifyRefreshToken(token)
  }

  async verifyAccessToken(token: string): Promise<AccessTokenResult | null> {
    return this.tokenGenerator.verifyAccessToken(token)
  }

  decodeRefreshToken(token: string): RefreshTokenResult | null {
    return this.tokenGenerator.decodeRefreshToken(token)
  }

  decodeAccessToken(token: string): AccessTokenResult | null {
    return this.tokenGenerator.decodeAccessToken(token)
  }

  extractTokenExpiry(token: string): Date {
    const identityPayload = this.decodeRefreshToken(token)
    const tenantPayload = this.decodeAccessToken(token)

    const exp = this.pickExp(identityPayload) ?? this.pickExp(tenantPayload)

    if (!exp) {
      throw new Error('Invalid token: missing exp claim')
    }

    return new Date(exp * 1000)
  }

  generateOtp(): Otp {
    return Otp.generate()
  }

  async saveOtp(context: OtpContext, email: Email, otp: Otp): Promise<void> {
    await this.otpManager.saveOtp(context, email, otp)
  }

  async getOtp(context: OtpContext, email: Email): Promise<string | null> {
    return this.otpManager.getOtp(context, email)
  }

  async deleteOtp(context: OtpContext, email: Email): Promise<void> {
    await this.otpManager.deleteOtp(context, email)
  }

  generateSecureToken(): string {
    return UuidUtil.generate()
  }

  async saveGrantToken(
    context: OtpContext,
    token: string,
    email: Email
  ): Promise<void> {
    await this.otpManager.saveGrantToken(context, token, email)
  }

  async getGrantTokenEmail(
    context: OtpContext,
    token: string
  ): Promise<string | null> {
    return this.otpManager.getGrantTokenEmail(context, token)
  }

  async deleteGrantToken(context: OtpContext, token: string): Promise<void> {
    await this.otpManager.deleteGrantToken(context, token)
  }

  async setOtpCooldown(context: OtpContext, email: Email): Promise<void> {
    await this.otpManager.setCooldown(context, email)
  }

  async isOtpOnCooldown(context: OtpContext, email: Email): Promise<boolean> {
    return this.otpManager.isOnCooldown(context, email)
  }

  async getOtpAttempts(context: OtpContext, email: Email): Promise<number> {
    return this.otpManager.getAttempts(context, email)
  }

  async incrementOtpAttempts(
    context: OtpContext,
    email: Email
  ): Promise<number> {
    return this.otpManager.incrementAttempts(context, email)
  }

  async resetOtpAttempts(context: OtpContext, email: Email): Promise<void> {
    await this.otpManager.resetAttempts(context, email)
  }

  hasExceededOtpAttempts(attempts: number): boolean {
    return attempts >= this.redisConfig.maxOtpPerDay
  }

  async initializeOnboardingFlow({
    registrationToken,
    email,
  }: InitializeOnboardingFlowPayload): Promise<void> {
    await this.onboardingCache.initializeFlow({
      registrationToken,
      email,
    })
  }

  async getOnboardingState(registrationToken: string) {
    return this.onboardingCache.getFlowState(registrationToken)
  }

  async updateOnboardingState(
    registrationToken: string,
    updates: Partial<Omit<OnboardingState, 'email'>>
  ): Promise<void> {
    await this.onboardingCache.updateFlowState(registrationToken, updates)
  }

  async completeOnboardingFlow(registrationToken: string): Promise<void> {
    await this.onboardingCache.completeFlow(registrationToken)
  }

  async sendEmailVerificationEmail(email: Email, otp: Otp): Promise<void> {
    await this.mailService.sendEmailVerificationEmail(
      email.value.toString(),
      otp.value.toString()
    )
  }

  async sendForgotPasswordEmail(email: Email, otp: Otp): Promise<void> {
    await this.mailService.sendForgotPasswordEmail(
      email.value.toString(),
      otp.value.toString()
    )
  }

  async hashPassword(password: Password): Promise<string> {
    return this.passwordHasher.hash(password)
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return this.passwordHasher.compare(plainPassword, hashedPassword)
  }

  private pickExp(payload: PayloadWithExp): number | null {
    if (!payload || typeof payload.exp !== 'number') {
      return null
    }

    return payload.exp
  }

  async isPlatformAdmin(userId: string): Promise<boolean> {
    try {
      const userIdObj = UserId.fromString(userId)

      // Fetch the global user role link
      const userRole =
        await this.userRoleRepository.findRoleDetailsByUserId(userIdObj)

      if (!userRole || !userRole.roleDetails) return false

      const adminKey = RoleName.create(SystemRole.PLATFORM_ADMIN)
      const roleNameKey = RoleName.create(userRole.roleDetails.name)

      return adminKey.value.equals(roleNameKey.value)
    } catch {
      // If any lookup fails or UUID parsing fails, fail secure (return false)
      return false
    }
  }

  async isSystemUser(userId: string): Promise<boolean> {
    const userIdObj = UserId.fromString(userId)

    return await this.userRoleRepository.exists(userIdObj)
  }

  async getWorkspaceAdminRoleId(): Promise<RoleId> {
    const roleName = RoleName.create(SystemRole.WORKSPACE_ADMIN)
    const role = await this.roleRepository.findSystemRoleByName(roleName.value)

    if (!role) throw new Error(`Role ${SystemRole.WORKSPACE_ADMIN} not found`)

    return role.id
  }

  async cachePermissions(jti: string, permissions: string[]): Promise<void> {
    await this.permissionCache.cachePermissions(jti, permissions)
  }
}
