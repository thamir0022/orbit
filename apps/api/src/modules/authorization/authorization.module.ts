import { Module } from '@nestjs/common'
import { PERMISSION_REPOSITORY } from './application/repositories/permission.repository'
import { MongoPermissionRepository } from './infrastructure/repositories/permission.repository'
import { ROLE_REPOSITORY } from './application/repositories/role.repository'
import { MongoRoleRepository } from './infrastructure/repositories/role.repository'
import { ROLE_PERMISSION_REPOSITORY } from './application/repositories/role-permission.repository'
import { MongoRolePermissionRepository } from './infrastructure/repositories/role-permission.repository'
import { MongooseModule } from '@nestjs/mongoose'
import {
  PermissionModel,
  PermissionSchema,
} from './infrastructure/schemas/permission.schema'
import { RoleModel, RoleSchema } from './infrastructure/schemas/role.schema'
import {
  RolePermissionModel,
  RolePermissionSchema,
} from './infrastructure/schemas/role-permission.schema'
import { PermissionSynchronizerService } from './system-permissions'
import { USER_ROLE_REPOSITORY } from './application/repositories/user-role.repository'
import { MongoUserRoleRepository } from './infrastructure/repositories/user-role.repository'
import {
  UserRoleModel,
  UserRoleSchema,
} from './infrastructure/schemas/user-role.schema'
import { RoleSynchronizerService } from './system-roles/role-synchronizer.service'
import { PERMISSION_CACHE_MANAGER } from './application/repositories/permission-cache-manager.interface'
import { RedisPermissionCacheManager } from './infrastructure/cache/redis-permission-cache-manager'
import { AuthorizationContoller } from './presentation/controllers/authorization.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PermissionModel.name, schema: PermissionSchema },
      { name: RoleModel.name, schema: RoleSchema },
      { name: UserRoleModel.name, schema: UserRoleSchema },
      { name: RolePermissionModel.name, schema: RolePermissionSchema },
    ]),
  ],
  controllers: [AuthorizationContoller],
  providers: [
    PermissionSynchronizerService,
    RoleSynchronizerService,
    { provide: PERMISSION_REPOSITORY, useClass: MongoPermissionRepository },
    { provide: ROLE_REPOSITORY, useClass: MongoRoleRepository },
    { provide: USER_ROLE_REPOSITORY, useClass: MongoUserRoleRepository },
    {
      provide: ROLE_PERMISSION_REPOSITORY,
      useClass: MongoRolePermissionRepository,
    },
    {
      provide: PERMISSION_CACHE_MANAGER,
      useClass: RedisPermissionCacheManager,
    },
  ],
  exports: [
    PERMISSION_REPOSITORY,
    ROLE_REPOSITORY,
    USER_ROLE_REPOSITORY,
    ROLE_PERMISSION_REPOSITORY,
    PERMISSION_CACHE_MANAGER,
    PermissionSynchronizerService,
    RoleSynchronizerService,
  ],
})
export class AuthorizationModule {}
