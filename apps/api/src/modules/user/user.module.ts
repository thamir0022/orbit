import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

// Schema
import { UserModel, UserSchema } from '@/modules/user/infrastructure'
// Controllers
import { UserController } from '@/modules/user/presentation'
import { userProviders } from './infrastructure/providers/user.provider'
import { RedisModule } from '@/shared/infrastructure'
import { GET_CURRENT_USER } from './application/usecases/get-current-user.interface'
import { GetCurrentUserUseCase } from './application/usecases/get-current-user.usecase'
import { USER_REPOSITORY } from './application'

/**
 * User Module
 * Encapsulates all user-related functionality
 */
@Module({
  imports: [
    CqrsModule,
    RedisModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    ...userProviders,
    { provide: GET_CURRENT_USER, useClass: GetCurrentUserUseCase },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
