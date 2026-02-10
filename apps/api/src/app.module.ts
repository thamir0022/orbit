import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongoDbModule } from '@/shared/infrastructure'
import { RedisModule } from '@/shared/infrastructure'
import { UserModule } from '@/modules/user/user.module'
import { GlobalExceptionFilter } from '@/shared/presentation/filters/global-exception.filter'
import { APP_FILTER } from '@nestjs/core'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

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
  ],
})
export class AppModule {}
