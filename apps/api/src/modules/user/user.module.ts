import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

// Schema
import { UserModel, UserSchema } from '@/modules/user/infrastructure'

// Controllers
import { UserController } from '@/modules/user/presentation'

import { RedisModule } from '@/shared/infrastructure'

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
  providers: [],
})
export class UserModule {}
