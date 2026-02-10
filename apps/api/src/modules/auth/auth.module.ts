import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { authProviders } from './infrastructure/providers/auth.provider'
import { RedisModule } from '@/shared/infrastructure'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModel, UserSchema } from '../user/infrastructure'
import { AuthController } from './presentation/auth.controller'
import { LocalStrategy } from './infrastructure/strategies/local.strategy'
import { SIGN_IN_WITH_EMAIL } from './application/usecases/sign-in-with-email.interface'
import { SignInWithEmailUseCase } from './application/usecases/sign-in-with-email.usecase'

@Module({
  imports: [
    RedisModule,
    PassportModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,
    LocalStrategy,
    { provide: SIGN_IN_WITH_EMAIL, useClass: SignInWithEmailUseCase },
  ],
})
export class AuthModule {}
