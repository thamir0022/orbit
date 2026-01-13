import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

// Schema
import { UserModel, UserSchema } from '@/modules/user/infrastructure'

// Controllers
import { UserController } from '@/modules/user/presentation'

// Providers
import { userProviders } from '@/modules/user/infrastructure'

// Command Handlers
import { SignUpHandler, SignInHandler } from '@/modules/user/application'

// Event Handlers
import {
  UserCreatedHandler,
  UserSignedInHandler,
} from '@/modules/user/application'

const commandHandlers = [SignUpHandler, SignInHandler]
const eventHandlers = [UserCreatedHandler, UserSignedInHandler]

/**
 * User Module
 * Encapsulates all user-related functionality
 */
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
