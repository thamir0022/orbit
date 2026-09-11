import { Module } from '@nestjs/common'
import { AppConfigModule } from '@/shared/infrastructure/config/config.module'
import { MongoDbModule, RedisModule } from '@/shared/infrastructure'
import { SharedModule } from '@/shared/shared.module'
import { AuthorizationModule } from '@/modules/authorization/authorization.module'
import { SecurityModule } from '@/shared/infrastructure/security/security.module'

@Module({
  imports: [
    AppConfigModule,
    MongoDbModule,
    SharedModule,
    AuthorizationModule,
    RedisModule,
    SecurityModule,
  ],
})
export class RoleModule {}
