import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { SignUpHandler } from './application/commands/sign-up/sign-up.handler'
import { SignInHandler } from './application/commands/sign-in/sign-in.handler'
import { UserCreatedHandler } from './application/event-handlers/user-created.handler'
import { UserSignedInHandler } from './application/event-handlers/user-sign-in.handler'
import { AuthController } from './presentation/controllers/auth.controller'
import { authProviders } from './infrastructure/providers/auth.providers'
import { RedisModule } from '../../shared/infrastructure/cache/redis.module'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModel, UserSchema } from '../user/infrastructure'
import { RefreshTokenHandler } from './application/commands/refresh-token/refresh-token.handler'

const commandHandlers = [SignUpHandler, SignInHandler, RefreshTokenHandler]
const eventHandlers = [UserCreatedHandler, UserSignedInHandler]

@Module({
  imports: [
    CqrsModule,
    RedisModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [...authProviders, ...commandHandlers, ...eventHandlers],
  exports: [...authProviders],
})
export class AuthModule {}
