import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongoDbModule } from '@/shared/infrastructure'
import { RedisModule } from '@/shared/infrastructure'
import { UserModule } from '@/modules/user/user.module'
import { DomainExceptionFilter } from '@/shared/presentation/filters/domain-exception.filter'
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
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
