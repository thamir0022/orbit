import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'
import {
  UserModel,
  UserSchema,
} from '@/modules/user/infrastructure'
import { UserController } from '@/modules/user/presentation'

// Providers
import { userProviders } from '@/modules/user/infrastructure'
import { SignUpHandler } from '@/modules/user/application'
import { UserCreatedHandler } from '@/modules/user/application'

const commandHandlers = [SignUpHandler]
const eventHandlers = [UserCreatedHandler]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [...userProviders, ...commandHandlers, ...eventHandlers],
  exports: [...userProviders],
})
export class UserModule {}
