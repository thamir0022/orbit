import { Module } from '@nestjs/common'
import { MongoDbModule } from '@/shared/infrastructure'
import { RedisModule } from '@/shared/infrastructure'
import { UserModule } from '@/modules/user/user.module'
import { GlobalExceptionFilter } from '@/shared/presentation/filters/global-exception.filter'
import { APP_FILTER } from '@nestjs/core'
import { AuthModule } from './modules/auth/auth.module'
import { AppConfigModule } from './modules/config/config.module'
import { MailModule } from './modules/mail/mail.module'

@Module({
  imports: [
    // App Configuration
    AppConfigModule,

    // Infrastructure
    MongoDbModule,
    RedisModule,

    // Features Module
    AuthModule,
    UserModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
