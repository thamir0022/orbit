import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Environment, EnvironmentVariables } from '../validation/env.validation'
import { IMongoConfig, IAppConfig } from '@/shared/infrastructure'
import { IRedisConfig } from '@/shared/infrastructure/interfaces/redis.config.interface'
import { IJwtConfig } from '@/modules/auth/infrastructure/interfaces/jwt.config.interface'
import { IOAuthConfig } from '@/modules/auth/infrastructure/interfaces/oauth.config.interface'
import { IMailConfig } from '@/modules/mail/infrastructure/config/mail.config.interface'

@Injectable()
export class AppConfigService
  implements
    IAppConfig,
    IMongoConfig,
    IRedisConfig,
    IJwtConfig,
    IOAuthConfig,
    IMailConfig
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

  get corsOrigins(): string {
    return this.configService.get('CORS_ORIGINS')
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

  get accessTokenExpiresIn(): number {
    return this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')
  }

  get refreshTokenExpiresIn(): number {
    return this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')
  }

  get accessTokenSecret(): string {
    return this.configService.get('JWT_ACCESS_SECRET')
  }

  get refreshTokenSecret(): string {
    return this.configService.get('JWT_REFRESH_SECRET')
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
}
