import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

// Schema
import { UserModel, UserSchema } from '@/modules/user/infrastructure'
// Controllers
import { UserController } from '@/modules/user/presentation'
import { userProviders } from './infrastructure/providers/user.provider'
import { RedisModule } from '@/shared/infrastructure'
import { GET_CURRENT_USER } from './application/usecases/current-user.interface'
import { GetCurrentUserUseCase } from './application/usecases/current-user.usecase'
import { USER_REPOSITORY } from './application'
import { GET_ALL_USERS } from './application/usecases/get-all-users.interface'
import { GetAllUsersUseCase } from './application/usecases/get-all-users.usecase'
import { EDIT_USER_PROFILE_USECASE } from './application/usecases/edit-user-profile.interface'
import { EditUserProfileUseCase } from './application/usecases/edit-user-profile.usecase'

/**
 * User Module
 * Encapsulates all user-related functionality
 */
@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    ...userProviders,
    { provide: GET_CURRENT_USER, useClass: GetCurrentUserUseCase },
    { provide: EDIT_USER_PROFILE_USECASE, useClass: EditUserProfileUseCase },
    { provide: GET_ALL_USERS, useClass: GetAllUsersUseCase },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
