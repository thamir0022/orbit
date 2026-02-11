import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validate } from './validation/validate.util'
import { AppConfigService } from './services/config.service'
import { APP_CONFIG, MONGODB_CONFIG } from '@/shared/infrastructure'
import { REDIS_CONFIG } from '@/shared/infrastructure/interfaces/redis.config.interface'
import { JWT_CONFIG } from '../auth/infrastructure/interfaces/jwt.config.interface'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: false,
      cache: true,
      envFilePath: ['.env', '.env.local'],
    }),
  ],
  providers: [
    AppConfigService,
    { provide: APP_CONFIG, useExisting: AppConfigModule },
    { provide: MONGODB_CONFIG, useExisting: AppConfigService },
    { provide: REDIS_CONFIG, useExisting: AppConfigService },
    { provide: JWT_CONFIG, useExisting: AppConfigService },
  ],
  exports: [AppConfigService, MONGODB_CONFIG, REDIS_CONFIG, JWT_CONFIG],
})
export class AppConfigModule {}
