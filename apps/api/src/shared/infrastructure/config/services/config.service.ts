import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Environment, EnvironmentVariables } from '../validation/env.validation'
import { IMongoConfig, IAppConfig } from '@/shared/infrastructure'
import { IRedisConfig } from '@/shared/infrastructure/interfaces/redis.config.interface'
import { ITokenConfig } from '@/modules/authentication/infrastructure/interfaces/token.config.interface'
import { IOAuthConfig } from '@/modules/authentication/infrastructure/interfaces/oauth.config.interface'
import { IMailConfig } from '@/modules/mail/infrastructure/config/mail.config.interface'
import { IFileConfig } from '@/modules/file/application/ports/file-config.port'

@Injectable()
export class AppConfigService
  implements
    IAppConfig,
    IMongoConfig,
    IRedisConfig,
    ITokenConfig,
    IOAuthConfig,
    IMailConfig,
    IFileConfig
{
  constructor(
    private configService: ConfigService<EnvironmentVariables, true>
  ) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV')
  }

  get port(): number {
    return this.configService.get('PORT')
  }

  get corsOrigins(): string[] {
    return this.configService
      .get<string>('CORS_ORIGINS', '')
      .split(',')
      .map((origin) => origin.trim())
  }

  get mongoDbURI(): string {
    return this.configService.get('MONGODB_URI')
  }

  get mongoDbName(): string {
    return this.configService.get('MONGODB_DB_NAME')
  }

  get redisUri(): string {
    return this.configService.get('REDIS_URI')
  }

  get sessionTTL(): number {
    return this.configService.get('SESSION_TTL')
  }

  get otpTTL(): number {
    return this.configService.get('OTP_TTL')
  }

  get otpResetTokenTTL(): number {
    return this.configService.get('OTP_RESET_TOKEN_TTL')
  }

  get signUpSessionTTL(): number {
    return this.configService.get('SIGNUP_SESSION_TTL')
  }

  get otpResendCooldownTTL(): number {
    return this.configService.get('OTP_RESET_RESEND_COOLDOWN_TTL')
  }

  get otpResendAttemptsTTL(): number {
    return this.configService.get('OTP_RESET_RESEND_ATTEMPTS_TTL')
  }

  get permissionTTL(): number {
    return this.configService.get('PERMISSION_CACHE_TTL')
  }

  get maxOtpPerDay(): number {
    return this.configService.get('MAX_RESET_PASSWORD_OTP_PER_DAY')
  }

  get refreshTokenExpiresIn(): number {
    return this.configService.get('IDENTITY_TOKEN_EXPIRES_IN')
  }

  get AccessTokenExpiresIn(): number {
    return this.configService.get('TENENT_TOKEN_EXPIRES_IN')
  }

  get refreshTokenSecret(): string {
    return this.configService.get('IDENTITY_TOKEN_SECRET')
  }

  get AccessTokenSecret(): string {
    return this.configService.get('TENENT_TOKEN_SECRET')
  }

  get issuer(): string {
    return this.configService.get('JWT_ISSUER')
  }

  get audience(): string {
    return this.configService.get('JWT_AUDIENCE')
  }

  get isProduction(): boolean {
    return (
      this.configService.get<Environment>('NODE_ENV') === Environment.PRODUCTION
    )
  }

  get googleClientId(): string {
    return this.configService.get('GOOGLE_CLIENT_ID')
  }

  get googleClientSecret(): string {
    return this.configService.get('GOOGLE_CLIENT_SECRET')
  }

  get googleCallbackUrl(): string {
    return this.configService.get('GOOGLE_CALLBACK_URL')
  }

  get frontEndUrl(): string {
    return this.configService.get('FRONTEND_URL')
  }

  get oAuthSuccessRedirectUrl(): string {
    return this.configService.get('OAUTH_SUCCESS_REDIRECT_URL')
  }

  get mailHost(): string {
    return this.configService.get('MAIL_HOST')
  }

  get mailPort(): number {
    return this.configService.get('MAIL_PORT')
  }

  get mailUser(): string {
    return this.configService.get('MAIL_USER')
  }

  get mailPass(): string {
    return this.configService.get('MAIL_PASS')
  }

  get mailFromName(): string {
    return this.configService.get('MAIL_FROM_NAME')
  }

  get mailFromEmail(): string {
    return this.configService.get('MAIL_FROM_EMAIL')
  }

  get observeAppKey(): string {
    return this.configService.get('OBSERVE_APP_KEY')
  }

  get observeAppSecret(): string {
    return this.configService.get('OBSERVE_APP_SECRET')
  }

  get s3Bucket(): string {
    return this.configService.get('FILE_S3_BUCKET')
  }

  get s3Region(): string {
    return this.configService.get('FILE_S3_REGION')
  }

  get storageLocationId(): string {
    return this.configService.get('FILE_STORAGE_LOCATION_ID')
  }

  get s3Endpoint(): string | undefined {
    return this.configService.get('FILE_S3_ENDPOINT')
  }

  get s3ForcePathStyle(): boolean {
    return this.configService.get('FILE_S3_FORCE_PATH_STYLE')
  }

  get workspaceQuotaBytes(): number {
    return this.configService.get('FILE_WORKSPACE_QUOTA_BYTES')
  }

  get userQuotaBytes(): number {
    return this.configService.get('FILE_USER_QUOTA_BYTES')
  }

  get uploadExpiresInSeconds(): number {
    return this.configService.get('FILE_UPLOAD_TTL_SECONDS')
  }

  get accessExpiresInSeconds(): number {
    return this.configService.get('FILE_ACCESS_TTL_SECONDS')
  }

  get clamAvHost(): string {
    return this.configService.get('FILE_CLAMAV_HOST')
  }

  get clamAvPort(): number {
    return this.configService.get('FILE_CLAMAV_PORT')
  }

  get clamAvTimeoutMs(): number {
    return this.configService.get('FILE_CLAMAV_TIMEOUT_MS')
  }
}
