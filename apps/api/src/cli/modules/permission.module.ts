import { AuthorizationModule } from '@/modules/authorization/authorization.module'
import { MongoDbModule, RedisModule } from '@/shared/infrastructure'
import { AppConfigModule } from '@/shared/infrastructure/config/config.module'
import { SecurityModule } from '@/shared/infrastructure/security/security.module'
import { SharedModule } from '@/shared/shared.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    AppConfigModule,
    MongoDbModule,
    AuthorizationModule,
    RedisModule,
    SharedModule,
    SecurityModule,
  ],
})
export class PermissionModule {}
