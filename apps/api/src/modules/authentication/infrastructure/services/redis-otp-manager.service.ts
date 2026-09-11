import { Inject, Injectable, Logger } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { type Cache } from 'cache-manager'
import { type IRedisConfig, REDIS_CONFIG } from '@/shared/infrastructure'
import { Email } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'
import {
  IOtpManager,
  OtpContext,
} from '../../application/ports/otp-manager.interface'

@Injectable()
export class RedisOtpManager implements IOtpManager {
  private readonly logger = new Logger(RedisOtpManager.name)

  private static readonly OTP_PREFIX = 'otp:'
  private static readonly TOKEN_PREFIX = 'grant-token:'
  private static readonly COOLDOWN_PREFIX = 'otp-cooldown:'
  private static readonly ATTEMPTS_PREFIX = 'otp-attempts:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    @Inject(REDIS_CONFIG)
    private readonly config: IRedisConfig
  ) {}

  /* -------------------------------------------------------------------------- */
  /* Core OTP Operations                                                        */
  /* -------------------------------------------------------------------------- */

  async saveOtp(context: OtpContext, email: Email, otp: Otp): Promise<void> {
    await this.cache.set(
      this.otpKey(context, email),
      otp.value,
      this.config.otpTTL
    )
  }

  async getOtp(context: OtpContext, email: Email): Promise<string | null> {
    const otp = await this.cache.get<string>(this.otpKey(context, email))
    return otp ?? null
  }

  async deleteOtp(context: OtpContext, email: Email): Promise<void> {
    await this.cache.del(this.otpKey(context, email))
  }

  /* -------------------------------------------------------------------------- */
  /* Security Tokens (Post-Verification Grants)                                 */
  /* -------------------------------------------------------------------------- */

  async saveGrantToken(
    context: OtpContext,
    token: string,
    email: Email
  ): Promise<void> {
    await this.cache.set(
      this.tokenKey(context, token),
      email.value,
      this.config.otpResetTokenTTL
    )
  }

  async getGrantTokenEmail(
    context: OtpContext,
    token: string
  ): Promise<string | null> {
    const emailValue = await this.cache.get<string>(
      this.tokenKey(context, token)
    )
    return emailValue ?? null
  }

  async deleteGrantToken(context: OtpContext, token: string): Promise<void> {
    await this.cache.del(this.tokenKey(context, token))
  }

  /* -------------------------------------------------------------------------- */
  /* Rate Limiting & Cooldowns                                                  */
  /* -------------------------------------------------------------------------- */

  async setCooldown(context: OtpContext, email: Email): Promise<void> {
    await this.cache.set(
      this.cooldownKey(context, email),
      'active',
      this.config.otpResendCooldownTTL
    )
  }

  async isOnCooldown(context: OtpContext, email: Email): Promise<boolean> {
    const cooldown = await this.cache.get<string>(
      this.cooldownKey(context, email)
    )
    return !!cooldown
  }

  async getAttempts(context: OtpContext, email: Email): Promise<number> {
    const attempts = await this.cache.get<number>(
      this.attemptsKey(context, email)
    )
    return attempts ?? 0
  }

  async incrementAttempts(context: OtpContext, email: Email): Promise<number> {
    const currentAttempts = await this.getAttempts(context, email)
    const newAttempts = currentAttempts + 1

    await this.cache.set(
      this.attemptsKey(context, email),
      newAttempts,
      this.config.otpResendAttemptsTTL
    )

    return newAttempts
  }

  async resetAttempts(context: OtpContext, email: Email): Promise<void> {
    await this.cache.del(this.attemptsKey(context, email))
  }

  /* -------------------------------------------------------------------------- */
  /* Private Key Generators                                                     */
  /* -------------------------------------------------------------------------- */

  private otpKey(context: OtpContext, email: Email): string {
    return `${RedisOtpManager.OTP_PREFIX}${context}:${email.value}`
  }

  private tokenKey(context: OtpContext, token: string): string {
    return `${RedisOtpManager.TOKEN_PREFIX}${context}:${token}`
  }

  private cooldownKey(context: OtpContext, email: Email): string {
    return `${RedisOtpManager.COOLDOWN_PREFIX}${context}:${email.value}`
  }

  private attemptsKey(context: OtpContext, email: Email): string {
    return `${RedisOtpManager.ATTEMPTS_PREFIX}${context}:${email.value}`
  }
}
