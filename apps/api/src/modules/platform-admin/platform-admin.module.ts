import { Module } from '@nestjs/common'
import { CREATE_PLATFORM_ADMIN_USE_CASE } from './application/usecases/create-platform-admin.interface'
import { CreatePlatformAdminUseCase } from './application/usecases/create-platform-admin.usecase'
import { UserModule } from '../user/user.module'
import { AuthorizationModule } from '../authorization/authorization.module'
import { SecurityModule } from '@/shared/infrastructure/security/security.module'
import { MongoDbModule } from '@/shared/infrastructure'

@Module({
  imports: [UserModule, AuthorizationModule, SecurityModule, MongoDbModule],
  providers: [
    {
      provide: CREATE_PLATFORM_ADMIN_USE_CASE,
      useClass: CreatePlatformAdminUseCase,
    },
  ],
})
export class PlatformAdminModule {}
