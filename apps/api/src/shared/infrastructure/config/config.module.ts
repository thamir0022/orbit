import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validate } from './validation/validate.util'
import { AppConfigService } from './services/config.service'
import { APP_CONFIG, MONGODB_CONFIG } from '@/shared/infrastructure'
import { REDIS_CONFIG } from '@/shared/infrastructure/interfaces/redis.config.interface'
import { TOKEN_CONFIG } from '@/modules/authentication/infrastructure/interfaces/token.config.interface'
import { OAUTH_CONFIG } from '@/modules/authentication/infrastructure/interfaces/oauth.config.interface'
import { MAIL_CONFIG } from '@/modules/mail/infrastructure/config/mail.config.interface'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      cache: true,
      envFilePath: ['.env', '.env.local'],
    }),
  ],
  providers: [
    AppConfigService,
    { provide: APP_CONFIG, useExisting: AppConfigService },
    { provide: MONGODB_CONFIG, useExisting: AppConfigService },
    { provide: REDIS_CONFIG, useExisting: AppConfigService },
    { provide: TOKEN_CONFIG, useExisting: AppConfigService },
    { provide: OAUTH_CONFIG, useExisting: AppConfigService },
    { provide: MAIL_CONFIG, useExisting: AppConfigService },
  ],
  exports: [
    AppConfigService,
    APP_CONFIG,
    MONGODB_CONFIG,
    REDIS_CONFIG,
    TOKEN_CONFIG,
    OAUTH_CONFIG,
    MAIL_CONFIG,
  ],
})
export class AppConfigModule {}
