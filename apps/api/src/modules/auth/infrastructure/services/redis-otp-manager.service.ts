import { Inject, Injectable } from '@nestjs/common'
import { IOtpManager } from '../../application/repositories/otp-manager.interface'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { type Cache } from 'cache-manager'
import { type IRedisConfig, REDIS_CONFIG } from '@/shared/infrastructure'
import { Email } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'

@Injectable()
export class RedisOtpManager implements IOtpManager {
  private static readonly RESET_PASS_OTP_PREFIX = 'reset-otp:'
  private static readonly RESET_PASS_TOKEN_PREFIX = 'reset-pass-token:'
  private static readonly AUTH_OTP_PREFIX = 'auth-otp:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly _cache: Cache,
    @Inject(REDIS_CONFIG)
    private readonly _config: IRedisConfig
  ) {}

  /**
   *
   * Set OTP
   * @param email
   * @param otp
   */
  async setPasswordResetOtp(email: Email, otp: Otp): Promise<void> {
    await this._cache.set(
      this.resetOtpKey(email.value),
      otp.value,
      this._config.otpTTL
    )
  }

  /**
   * Get OTP
   * @param email
   * @returns otp
   */
  async getPasswordResetOtp(email: Email): Promise<string | null | undefined> {
    return await this._cache.get(this.resetOtpKey(email.value))
  }

  /**
   *
   * @param email
   */
  async deletePasswordResetOtp(email: Email): Promise<void> {
    await this._cache.del(this.resetOtpKey(email.value))
  }

  /**
   *
   * @param token
   * @param email
   */
  async setPasswordResetToken(token: string, email: Email): Promise<void> {
    await this._cache.set(
      this.resetTokenKey(token),
      email.value,
      this._config.otpResetTokenTTL
    )
  }

  /**
   *
   * @param token
   * @returns
   */
  async getPasswordResetToken(
    token: string
  ): Promise<string | null | undefined> {
    return await this._cache.get(this.resetTokenKey(token))
  }

  async setEmailVerifyOtp(email: Email, otp: Otp): Promise<void> {
    await this._cache.set(
      this.authOtpKey(email.value),
      otp.value,
      this._config.otpTTL
    )
  }

  async getEmailVerifyOtp(email: Email): Promise<string | null | undefined> {
    return await this._cache.get(this.authOtpKey(email.value))
  }

  async deleteEmailVerifyOtp(email: Email): Promise<void> {
    await this._cache.del(this.authOtpKey(email.value))
  }

  /**
   *
   * @param token
   */
  async detelePasswordResetToken(token: string): Promise<void> {
    await this._cache.del(this.resetTokenKey(token))
  }

  private resetOtpKey(email: string): string {
    return `${RedisOtpManager.RESET_PASS_OTP_PREFIX}${email}`
  }

  private resetTokenKey(token: string): string {
    return `${RedisOtpManager.RESET_PASS_TOKEN_PREFIX}${token}`
  }

  private authOtpKey(email: string): string {
    return `${RedisOtpManager.AUTH_OTP_PREFIX}${email}`
  }
}
