import { AuthorizationModule } from '@/modules/authorization/authorization.module'
import { PlatformAdminModule } from '@/modules/platform-admin/platform-admin.module'
import { UserModule } from '@/modules/user/user.module'
import { MongoDbModule } from '@/shared/infrastructure'
import { AppConfigModule } from '@/shared/infrastructure/config/config.module'
import { SecurityModule } from '@/shared/infrastructure/security/security.module'
import { SharedModule } from '@/shared/shared.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    AppConfigModule,
    SharedModule,
    MongoDbModule,
    UserModule,
    AuthorizationModule,
    SecurityModule,
    PlatformAdminModule,
  ],
})
export class AdminModule {}
