import { Module } from '@nestjs/common'
import { authProviders } from './infrastructure/providers/auth.provider'
import { RedisModule } from '@/shared/infrastructure'
import { AuthController } from './presentation/auth.controller'
import { SIGN_IN_WITH_EMAIL } from './application/usecases/sign-in-with-email.interface'
import { SignInWithEmailUseCase } from './application/usecases/sign-in-with-email.usecase'
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
import { WorkspaceModule } from '../workspace/workspace.module'
import { JwtModule } from '@nestjs/jwt'
import { PASSWORD_RESET_RESEND_OTP } from './application/usecases/password-reset-resend-otp.interface'
import { PasswordResetResendOtpUseCase } from './application/usecases/password-reset-resend-otp.usecase'
import { EXCHANGE_TOKEN } from './application/usecases/exchange-token.interface'
import { ExchangeTokenUseCase } from './application/usecases/exchange-token.usecase'
import { SIGN_OUT } from './application/usecases/sign-out.interface'
import { SignOutUseCase } from './application/usecases/sign-out.usecase'
import { AuthorizationModule } from '../authorization/authorization.module'
import { COMPLETE_REGISTRATION } from './application/usecases/complete-registration.interface'
import { CompleteRegistrationUseCase } from './application/usecases/complete-registration.usecase'
import { SIGN_UP_RESEND_OTP } from './application/usecases/sign-up-resend-otp.interface'
import { SignUpResendOtpUseCase } from './application/usecases/sign-up-resend-otp.usecase'
import { CHANGE_PASSWORD } from './application/usecases/change-password.interface'
import { ChangePasswordUseCase } from './application/usecases/change-password.usecase'
import { GET_ACTIVE_SESSIONS } from './application/usecases/get-active-sessions.interface'
import { GetActiveSessionsUseCase } from './application/usecases/get-active-sessions.usecase'

@Module({
  imports: [
    UserModule,
    WorkspaceModule,
    RedisModule,
    AuthorizationModule,
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,
    GoogleOAuthProvider,
    {
      provide: SIGN_UP_INITIATE,
      useClass: SignUpInitiateWithEmailUseCase,
    },
    {
      provide: SIGN_UP_RESEND_OTP,
      useClass: SignUpResendOtpUseCase,
    },
    {
      provide: SIGN_UP_VERIFY_EMAIL,
      useClass: SignUpVerifyEmailUseCase,
    },
    {
      provide: SIGN_UP_USER_DETAILS,
      useClass: UserDetailsUseCase,
    },
    {
      provide: SIGN_UP_COMPLETE,
      useClass: SignUpCompleteUseCase,
    },
    {
      provide: COMPLETE_REGISTRATION,
      useClass: CompleteRegistrationUseCase,
    },
    {
      provide: SIGN_IN_WITH_EMAIL,
      useClass: SignInWithEmailUseCase,
    },
    {
      provide: EXCHANGE_TOKEN,
      useClass: ExchangeTokenUseCase,
    },
    {
      provide: PASSWORD_RESET_REQUEST,
      useClass: PasswordResetRequestUseCase,
    },
    {
      provide: PASSWORD_RESET_VERIFY,
      useClass: PasswordResetVerifyUseCase,
    },
    {
      provide: PASSWORD_RESET_CONFIRM,
      useClass: PasswordResetConfirmUseCase,
    },
    {
      provide: CHANGE_PASSWORD,
      useClass: ChangePasswordUseCase,
    },
    {
      provide: PASSWORD_RESET_RESEND_OTP,
      useClass: PasswordResetResendOtpUseCase,
    },
    {
      provide: AUTHENTICATE_WITH_OAUTH,
      useClass: AuthenticateWithOAuthUseCase,
    },
    {
      provide: SIGN_OUT,
      useClass: SignOutUseCase,
    },

    // Sessions
    {
      provide: GET_ACTIVE_SESSIONS,
      useClass: GetActiveSessionsUseCase,
    },
  ],
})
export class AuthenticationModule {}
