import { Module } from '@nestjs/common'
import { authProviders } from './infrastructure/providers/auth.provider'
import { RedisModule } from '@/shared/infrastructure'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModel, UserSchema } from '../user/infrastructure'
import { AuthController } from './presentation/auth.controller'
import { SIGN_IN_WITH_EMAIL } from './application/usecases/sign-in-with-email.interface'
import { SignInWithEmailUseCase } from './application/usecases/sign-in-with-email.usecase'
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
import { UserModule } from '../user/user.module'
import { SIGN_UP_INITIATE } from './application/usecases/sign-up-initiate-with-email.interface'
import { SignUpInitiateWithEmailUseCase } from './application/usecases/sign-up-initiate-with-email.usecase'
import { SIGN_UP_VERIFY_EMAIL } from './application/usecases/sign-up-verify-email-with-otp.interface'
import { SignUpVerifyEmailUseCase } from './application/usecases/sign-up-verify-email-with-otp.usecase'
import { SIGN_UP_USER_DETAILS } from './application/usecases/sign-up-user-details.interface'
import { UserDetailsUseCase } from './application/usecases/sign-up-user-details.usecase'
import { SIGN_UP_COMPLETE } from './application/usecases/sign-up-complete.interface'
import { SignUpCompleteUseCase } from './application/usecases/sign-up-complete.usecase'
import { OrganizationModule } from '../organization/organization.module'
import { AUTH_SERVICE } from './application/services/auth.service.interface'
import { AuthService } from './application/services/auth.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import {
  IJwtConfig,
  JWT_CONFIG,
} from './infrastructure/interfaces/jwt.config.interface'
import { JWT_ACCESS, JWT_REFRESH } from './application/constants/auth.constant'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './presentation/guards'

@Module({
  imports: [
    UserModule,
    OrganizationModule,
    RedisModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,
    {
      provide: JWT_ACCESS,
      inject: [JWT_CONFIG],
      useFactory: (config: IJwtConfig) =>
        new JwtService({
          secret: config.accessTokenSecret,
          signOptions: { expiresIn: config.accessTokenExpiresIn },
        }),
    },
    {
      provide: JWT_REFRESH,
      inject: [JWT_CONFIG],
      useFactory: (config: IJwtConfig) =>
        new JwtService({
          secret: config.refreshTokenSecret,
          signOptions: { expiresIn: config.refreshTokenExpiresIn },
        }),
    },
    GoogleOAuthProvider,
    { provide: SIGN_UP_INITIATE, useClass: SignUpInitiateWithEmailUseCase },
    { provide: SIGN_UP_VERIFY_EMAIL, useClass: SignUpVerifyEmailUseCase },
    { provide: SIGN_UP_USER_DETAILS, useClass: UserDetailsUseCase },
    { provide: SIGN_UP_COMPLETE, useClass: SignUpCompleteUseCase },
    { provide: SIGN_IN_WITH_EMAIL, useClass: SignInWithEmailUseCase },
    { provide: REFRESH_TOKEN, useClass: RefreshTokenUseCase },
    { provide: PASSWORD_RESET_REQUEST, useClass: PasswordResetRequestUseCase },
    { provide: PASSWORD_RESET_VERIFY, useClass: PasswordResetVerifyUseCase },
    { provide: PASSWORD_RESET_CONFIRM, useClass: PasswordResetConfirmUseCase },
    {
      provide: AUTHENTICATE_WITH_OAUTH,
      useClass: AuthenticateWithOAuthUseCase,
    },
    { provide: AUTH_SERVICE, useClass: AuthService },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
