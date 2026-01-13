import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'
import {
  UserModel,
  UserSchema,
} from '@/modules/user/infrastructure/persistence/schema/user.schema'
import { UserController } from '@/modules/user/presentation/controllers/user.controller'

// Providers
import { userProviders } from '@/modules/user/infrastructure/providers/user.providers'
import { SignUpHandler } from '@/modules/user/application/commands/sign-up/sign-up.handler'
import { UserCreatedHandler } from '@/modules/user/application/event-handlers/user-created.handler'

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
