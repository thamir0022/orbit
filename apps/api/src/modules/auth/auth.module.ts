import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { authProviders } from './infrastructure/providers/auth.provider'
import { RedisModule } from '@/shared/infrastructure'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModel, UserSchema } from '../user/infrastructure'
import { AuthController } from './presentation/auth.controller'
import { SIGN_IN_WITH_EMAIL } from './application/usecases/sign-in-with-email.interface'
import { SignInWithEmailUseCase } from './application/usecases/sign-in-with-email.usecase'
import { SIGN_UP_WITH_EMAIL } from './application/usecases/sign-up-with-email.interface'
import { SignUpWithEmailUseCase } from './application/usecases/sign-up-with-email.usecase'

@Module({
  imports: [
    RedisModule,
    PassportModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,
    { provide: SIGN_IN_WITH_EMAIL, useClass: SignInWithEmailUseCase },
    { provide: SIGN_UP_WITH_EMAIL, useClass: SignUpWithEmailUseCase },
  ],
})
export class AuthModule {}
