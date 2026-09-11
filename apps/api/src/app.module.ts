import { Module } from '@nestjs/common'
import { MongoDbModule } from '@/shared/infrastructure'
import { RedisModule } from '@/shared/infrastructure'
import { UserModule } from '@/modules/user/user.module'
import { GlobalExceptionFilter } from '@/shared/presentation/filters/global-exception.filter'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthenticationModule } from './modules/authentication/authentication.module'
import { AppConfigModule } from './shared/infrastructure/config/config.module'
import { MailModule } from './modules/mail/mail.module'
import { ResponseInterceptor } from './shared/presentation/intercepters/response.intercepter'
import { WorkspaceModule } from './modules/workspace/workspace.module'
import { SharedModule } from './shared/shared.module'
import { SecurityModule } from './shared/infrastructure/security/security.module'
import { AuthorizationModule } from './modules/authorization/authorization.module'
import { PlatformAdminModule } from './modules/platform-admin/platform-admin.module'
import { ProjectModule } from './modules/project/project.module'

@Module({
  imports: [
    // App Configuration
    AppConfigModule,

    // Infrastructure
    MongoDbModule,
    RedisModule,
    SecurityModule,

    // Shared
    SharedModule,

    // Features Module
    AuthenticationModule,
    AuthorizationModule,
    UserModule,
    MailModule,
    WorkspaceModule,
    PlatformAdminModule,
    ProjectModule,
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
