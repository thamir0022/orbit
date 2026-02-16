import { Module } from '@nestjs/common'
import { MongoDbModule } from '@/shared/infrastructure'
import { RedisModule } from '@/shared/infrastructure'
import { UserModule } from '@/modules/user/user.module'
import { GlobalExceptionFilter } from '@/shared/presentation/filters/global-exception.filter'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthModule } from './modules/auth/auth.module'
import { AppConfigModule } from './modules/config/config.module'
import { ResponseInterceptor } from './shared/presentation/intercepters/response.intercepter'

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
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
