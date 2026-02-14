import { Inject, Injectable } from '@nestjs/common'
import {
  IOtpManager,
  OtpData,
  OtpTokenData,
} from '../../application/repositories/otp-manager.interface'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { type Cache } from 'cache-manager'
import { type IRedisConfig, REDIS_CONFIG } from '@/shared/infrastructure'
import { Email } from '@/modules/user/domain'

@Injectable()
export class RedisOtpManager implements IOtpManager {
  private static readonly OTP_PREFIX = 'reset-otp:'
  private static readonly OTP_RESET_TOKEN_PREFIX = 'reset-otp-token:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly _cache: Cache,
    @Inject(REDIS_CONFIG)
    private readonly _config: IRedisConfig
  ) {}

  /**
   *
   * Set OTP
   * @param otp
   * @param email
   */
  async setOtp({ otp, email }: OtpData): Promise<void> {
    await this._cache.set(
      this.resetOtpKey(email.value),
      otp.value,
      this._config.otpTTL
    )
  }

  /**
   * Get OTP
   * @param email
   * @returns
   */
  async getOtp(email: Email): Promise<string | null | undefined> {
    return await this._cache.get(this.resetOtpKey(email.value))
  }

  /**
   *
   * @param email
   */
  async deleteOtp(email: Email): Promise<void> {
    await this._cache.del(this.resetOtpKey(email.value))
  }

  /**
   *
   * @param OtpTokenData
   */
  async setResetOtpToken({ email, resetToken }: OtpTokenData): Promise<void> {
    await this._cache.set(
      this.resetTokenKey(resetToken),
      email.value,
      this._config.otpResetTokenTTL
    )
  }

  /**
   *
   * @param token
   * @returns
   */
  async getResetOtpToken(token: string): Promise<string | null | undefined> {
    return await this._cache.get(this.resetTokenKey(token))
  }

  /**
   *
   * @param token
   */
  async deteleResetOtpToken(token: string): Promise<void> {
    await this._cache.del(this.resetTokenKey(token))
  }

  private resetOtpKey(email: string): string {
    return `${RedisOtpManager.OTP_PREFIX}${email}`
  }

  private resetTokenKey(token: string): string {
    return `${RedisOtpManager.OTP_RESET_TOKEN_PREFIX}${token}`
  }
}
