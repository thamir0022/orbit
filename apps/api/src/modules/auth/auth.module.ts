import { Module } from '@nestjs/common'
import { authProviders } from './infrastructure/providers/auth.provider'
import { RedisModule } from '@/shared/infrastructure'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModel, UserSchema } from '../user/infrastructure'
import { AuthController } from './presentation/auth.controller'
import { SIGN_IN_WITH_EMAIL } from './application/usecases/sign-in-with-email.interface'
import { SignInWithEmailUseCase } from './application/usecases/sign-in-with-email.usecase'
import { SIGN_UP_WITH_EMAIL } from './application/usecases/sign-up-with-email.interface'
import { SignUpWithEmailUseCase } from './application/usecases/sign-up-with-email.usecase'
import { REFRESH_TOKEN } from './application/usecases/refresh-token.interface'
import { RefreshTokenUseCase } from './application/usecases/refresh-token.usecase'
import { PASSWORD_RESET_REQUEST } from './application/usecases/password-reset-request.interface'
import { PasswordResetRequestUseCase } from './application/usecases/password-reset-request.usecase'
import { PASSWORD_RESET_VERIFY } from './application/usecases/password-reset-verify.interface'
import { PasswordResetVerifyUseCase } from './application/usecases/password-reset-verify.usecase'
import { PASSWORD_RESET_CONFIRM } from './application/usecases/password-reset-confirm.interface'
import { PasswordResetConfirmUseCase } from './application/usecases/password-reset-confirm.usecase'
import { AUTHENTICATE_WITH_OAUTH } from './application/usecases/authenticate-with-oauth.interface'
import { AuthenticateWithOAuthUseCase } from './application/usecases/authenticate-with-oauth.usecase'
import { GoogleOAuthProvider } from './infrastructure/providers/google.provider'

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,
    GoogleOAuthProvider,
    { provide: SIGN_IN_WITH_EMAIL, useClass: SignInWithEmailUseCase },
    { provide: SIGN_UP_WITH_EMAIL, useClass: SignUpWithEmailUseCase },
    { provide: REFRESH_TOKEN, useClass: RefreshTokenUseCase },
    { provide: PASSWORD_RESET_REQUEST, useClass: PasswordResetRequestUseCase },
    { provide: PASSWORD_RESET_VERIFY, useClass: PasswordResetVerifyUseCase },
    { provide: PASSWORD_RESET_CONFIRM, useClass: PasswordResetConfirmUseCase },
    {
      provide: AUTHENTICATE_WITH_OAUTH,
      useClass: AuthenticateWithOAuthUseCase,
    },
  ],
})
export class AuthModule {}
