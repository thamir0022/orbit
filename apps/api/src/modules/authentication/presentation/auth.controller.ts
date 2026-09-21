import {
  ChangePasswordRequestDto,
  CompleteRegistrationRequest,
  ExchnageTokenRequestDto,
  GetActiveSessionsResponseDto,
  SignInResponseDto,
  SignUpCompleteResponseDto,
  SignUpResendOtpRequest,
  SignUpVerifyEmailWithOtpResponseDto,
} from './dtos'
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Ip,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { Response } from 'express'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import {
  type ISignInWithEmailUseCase,
  SIGN_IN_WITH_EMAIL,
} from '../application/usecases/sign-in-with-email.interface'
import { ApiResponseDto } from '@/shared/presentation/dtos/api-response.dto'
import {
  type ITokenConfig,
  TOKEN_CONFIG,
} from '../infrastructure/interfaces/token.config.interface'
import {
  type IPasswordResetRequestUseCase,
  PASSWORD_RESET_REQUEST,
} from '../application/usecases/password-reset-request.interface'
import {
  PASSWORD_RESET_VERIFY,
  type IPasswordResetVerifyUseCase,
} from '../application/usecases/password-reset-verify.interface'
import {
  type IPasswordResetConfirmUseCase,
  PASSWORD_RESET_CONFIRM,
} from '../application/usecases/password-reset-confirm.interface'
import {
  AUTHENTICATE_WITH_OAUTH,
  type IAuthenticateWithOAuthUseCase,
} from '../application/usecases/authenticate-with-oauth.interface'
import { AuthProvider } from '@/modules/user/domain'
import { IAppConfig } from '@/shared/infrastructure'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { AuthResponseMessage } from './enums/response-messages.enum'
import {
  type IUserDetailsUseCase,
  SIGN_UP_USER_DETAILS,
} from '../application/usecases/sign-up-user-details.interface'
import {
  type ISignUpCompleteUseCase,
  SIGN_UP_COMPLETE,
} from '../application/usecases/sign-up-complete.interface'
import {
  type ISignUpInitiateWithEmailUseCase,
  SIGN_UP_INITIATE,
} from '../application/usecases/sign-up-initiate-with-email.interface'
import {
  type ISignUpVerifyEmailWithOtpUseCase,
  SIGN_UP_VERIFY_EMAIL,
} from '../application/usecases/sign-up-verify-email-with-otp.interface'
import { Public } from '@/shared/presentation/decorators/public.decorator'
import {
  PASSWORD_RESET_RESEND_OTP,
  type IPasswordResetResendOtpUseCase,
} from '../application/usecases/password-reset-resend-otp.interface'
import {
  PasswordResetConfirmRequestDto,
  PasswordResetRequestDto,
  PasswordResetResendOtpRequestDto,
  PasswordResetVerifyRequestDto,
  PasswordResetVerifyResponseDto,
  SignInRequestDto,
  SignUpCompleteRequestDto,
  SignUpInititateWithEmailRequestDto,
  SignUpUserDetailsRequestDto,
  SignUpVerifyEmailWithOtpRequestDto,
} from './dtos'
import { SignUpUserDetailsResponseDto } from './dtos/sign-up-user-details-response.dto'
import {
  EXCHANGE_TOKEN,
  type IExchangeTokenUseCase,
} from '../application/usecases/exchange-token.interface'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { RefreshTokenGuard } from '@/modules/authentication/presentation/guards/refresh-token.guard'
import {
  type ISignOutUseCase,
  SIGN_OUT,
} from '../application/usecases/sign-out.interface'
import {
  COMPLETE_REGISTRATION,
  type ICompleteRegistrationUseCase,
} from '../application/usecases/complete-registration.interface'
import {
  type ISignupResendOtpUseCase,
  SIGN_UP_RESEND_OTP,
} from '../application/usecases/sign-up-resend-otp.interface'
import {
  CHANGE_PASSWORD,
  IChangePasswordUseCase,
} from '../application/usecases/change-password.interface'
import { ChangePasswordResponseDto } from './dtos/responses/change-password.request.dto'
import {
  GET_ACTIVE_SESSIONS,
  IGetActiveSessionsUseCase,
} from '../application/usecases/get-active-sessions.interface'
import { AuthContext } from '@/shared/domain/types'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SIGN_UP_INITIATE)
    private readonly _signUpInitiateWithEmailUseCase: ISignUpInitiateWithEmailUseCase,
    @Inject(SIGN_UP_RESEND_OTP)
    private readonly signUpResendOtpUseCase: ISignupResendOtpUseCase,
    @Inject(SIGN_UP_VERIFY_EMAIL)
    private readonly _signUpVerifyEmailWithOtpUseCase: ISignUpVerifyEmailWithOtpUseCase,
    @Inject(SIGN_UP_USER_DETAILS)
    private readonly _signUpUserDetails: IUserDetailsUseCase,
    @Inject(SIGN_UP_COMPLETE)
    private readonly _signUpComplete: ISignUpCompleteUseCase,
    @Inject(COMPLETE_REGISTRATION)
    private readonly completeRegistrationUseCase: ICompleteRegistrationUseCase,
    @Inject(SIGN_IN_WITH_EMAIL)
    private readonly _signInWithEmailUseCase: ISignInWithEmailUseCase,
    @Inject(PASSWORD_RESET_REQUEST)
    private readonly _passwordResetRequestUseCase: IPasswordResetRequestUseCase,
    @Inject(PASSWORD_RESET_VERIFY)
    private readonly _passwordResetVerifyUseCase: IPasswordResetVerifyUseCase,
    @Inject(PASSWORD_RESET_CONFIRM)
    private readonly _passwordResetConfirmUseCase: IPasswordResetConfirmUseCase,
    @Inject(PASSWORD_RESET_RESEND_OTP)
    private readonly _passwordResetResendOtp: IPasswordResetResendOtpUseCase,
    @Inject(CHANGE_PASSWORD)
    private readonly _changePasswordUseCase: IChangePasswordUseCase,
    @Inject(AUTHENTICATE_WITH_OAUTH)
    private readonly _authenticateWithOAuthUseCase: IAuthenticateWithOAuthUseCase,
    @Inject(EXCHANGE_TOKEN)
    private readonly exchangeTokenUseCase: IExchangeTokenUseCase,
    @Inject(SIGN_OUT)
    private readonly signOutUseCase: ISignOutUseCase,
    @Inject(GET_ACTIVE_SESSIONS)
    private readonly getSessionsUseCase: IGetActiveSessionsUseCase,
    @Inject(TOKEN_CONFIG)
    private readonly _config: ITokenConfig & IAppConfig
  ) {}

  @Post('sign-in')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: SignInRequestDto })
  @ApiCreatedResponse({
    description: 'Account signin successfull',
    type: ApiResponseDto<null>,
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    type: ApiResponseDto<null>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ApiResponseDto<null>,
  })
  @ResponseMessage(AuthResponseMessage.SIGN_IN_SUCCESS)
  async signIn(
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Body() request: SignInRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignInResponseDto> {
    const { email, password } = request

    const { refreshToken, expiresIn, workspaces } =
      await this._signInWithEmailUseCase.execute({
        email: email,
        password: password,
        clientInfo: { ipAddress, userAgent },
      })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this._config.isProduction,
      expires: expiresIn,
    })

    return { workspaces }
  }

  @Post('/sign-up/initiate')
  @Public()
  @ResponseMessage(AuthResponseMessage.SIGNUP_INITIATE_SUCCESS)
  async initiateSignUp(
    @Body() request: SignUpInititateWithEmailRequestDto
  ): Promise<void> {
    await this._signUpInitiateWithEmailUseCase.execute({
      email: request.email,
    })
  }

  @Post('/sign-up/resend')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.SIGNUP_RESEND_OTP)
  async signUpResendOtp(
    @Body() request: SignUpResendOtpRequest
  ): Promise<void> {
    await this.signUpResendOtpUseCase.execute({ email: request.email })
  }

  @Post('/sign-up/verify')
  @Public()
  @ResponseMessage(AuthResponseMessage.SIGNUP_VERIFY_SUCCESS)
  async verifyEmailWithOtp(
    @Body() request: SignUpVerifyEmailWithOtpRequestDto
  ): Promise<SignUpVerifyEmailWithOtpResponseDto> {
    const { code, email } = request
    return await this._signUpVerifyEmailWithOtpUseCase.execute({
      email: email,
      code: code,
    })
  }

  @Post('/sign-up/details')
  @Public()
  @ResponseMessage(AuthResponseMessage.SIGNUP_DETAILS_SUCCESS)
  async userDetails(
    @Body() request: SignUpUserDetailsRequestDto
  ): Promise<SignUpUserDetailsResponseDto> {
    const { registrationToken, firstName, lastName, password } = request
    return await this._signUpUserDetails.execute({
      firstName: firstName,
      lastName: lastName,
      password: password,
      registrationToken: registrationToken,
    })
  }

  @Post('/sign-up/complete')
  @Public()
  @ResponseMessage(AuthResponseMessage.SIGNUP_COMPLETE_SUCCESS)
  async createWorkspace(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Body() request: SignUpCompleteRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignUpCompleteResponseDto> {
    const { registrationToken, name, slug, companySize, companyType } = request
    const {
      refreshToken,
      expiresIn,
      slug: workSpaceSlug,
    } = await this._signUpComplete.execute({
      name,
      slug,
      companySize,
      companyType,
      registrationToken,
      clientInfo: { ipAddress, userAgent },
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this._config.isProduction,
      expires: expiresIn,
    })

    return { slug: workSpaceSlug }
  }

  @Post('/complete-registration')
  @Public()
  async completeRegistration(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Body() request: CompleteRegistrationRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const {
      registrationToken,
      invitationToken,
      firstName,
      lastName,
      password,
    } = request
    const { refreshToken, slug, expiresIn } =
      await this.completeRegistrationUseCase.execute({
        registrationToken,
        invitationToken,
        firstName,
        lastName,
        password,
        clientInfo: {
          ipAddress,
          userAgent,
        },
      })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this._config.isProduction,
      expires: expiresIn,
    })

    return { slug }
  }

  @Post('password-reset/request')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.PASSWORD_RESET_REQUEST_SUCCESS)
  async requestPasswordReset(
    @Body() request: PasswordResetRequestDto
  ): Promise<void> {
    await this._passwordResetRequestUseCase.execute({
      email: request.email,
    })
  }

  @Post('password-reset/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.PASSWORD_RESET_VERIFY_SUCCESS)
  async verifyPasswordReset(
    @Body() request: PasswordResetVerifyRequestDto
  ): Promise<PasswordResetVerifyResponseDto> {
    const { email, otp } = request
    return await this._passwordResetVerifyUseCase.execute({
      email,
      otp,
    })
  }

  @Post('password-reset/confirm')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.PASSWORD_RESET_CONFIRM_SUCCESS)
  async confirmPasswordReset(
    @Body() request: PasswordResetConfirmRequestDto
  ): Promise<void> {
    const { resetToken, newPassword } = request
    await this._passwordResetConfirmUseCase.execute({
      resetToken,
      newPassword,
    })
  }

  @Post('password-reset/resend')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.PASSWORD_RESET_OTP_RESEND_SUCCESS)
  async resendPasswordResetOtp(
    @Body() passwordResetResendOtpRequest: PasswordResetResendOtpRequestDto
  ): Promise<void> {
    await this._passwordResetResendOtp.execute({
      email: passwordResetResendOtpRequest.email,
    })
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.CHANGE_PASSWORD_SUCCESS)
  async changePassword(
    @CurrentAuth('userId') userId: string,
    @Body() request: ChangePasswordRequestDto
  ): Promise<ChangePasswordResponseDto> {
    return this._changePasswordUseCase.execute({
      userId,
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    })
  }

  @Get('oauth/:provider')
  @Public()
  @HttpCode(HttpStatus.TEMPORARY_REDIRECT)
  @ResponseMessage(AuthResponseMessage.OAUTH_REDIRECT_INITIATED)
  authenticateWithOAuth(
    @Param('provider', new ParseEnumPipe(AuthProvider)) provider: AuthProvider,
    @Res() res: Response
  ) {
    const url = this._authenticateWithOAuthUseCase.getRedirectUrl(provider)
    return res.redirect(url)
  }

  @Get('oauth/:provider/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.OAUTH_VERIFY_SUCCESS)
  async authenticateWithOAuthCallback(
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Param('provider', new ParseEnumPipe(AuthProvider))
    provider: AuthProvider,
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response
  ): Promise<void> {
    if (error)
      res.redirect(
        `${this._config.frontEndUrl}/oauth?success=false&error=${error}&provider=${provider}`
      )

    if (!code)
      res.redirect(
        `${this._config.frontEndUrl}/oauth?success=false&error=no_code&provider=${provider}`
      )

    const { isNewUser, refreshToken, expiresIn } =
      await this._authenticateWithOAuthUseCase.execute({
        code,
        provider,
        clientInfo: {
          userAgent,
          ipAddress,
        },
      })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this._config.isProduction,
      expires: expiresIn,
    })

    const redirectURL = isNewUser
      ? `${this._config.oAuthSuccessRedirectUrl}/new?isNewUser=true`
      : `${this._config.oAuthSuccessRedirectUrl}`

    res.redirect(redirectURL)
  }

  @Post('exchange')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async exchangeToken(
    @CurrentAuth() auth: AuthContext,
    @Body() request: ExchnageTokenRequestDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { workspace, accessToken, expiresIn } =
      await this.exchangeTokenUseCase.execute({
        sid: auth.sessionId,
        userId: auth.userId,
        slug: request.slug,
      })

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this._config.isProduction,
      expires: expiresIn,
    })

    return { workspace }
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Signs out the user and destroys HttpOnly sessions',
  })
  @ApiResponse({ status: 200, description: 'Successfully signed out' })
  @ResponseMessage(AuthResponseMessage.SIGN_OUT_SUCCESS)
  async signOut(
    @CurrentAuth('sessionId') sid: string,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.signOutUseCase.execute({ sid })

    const cookieOptions = {
      httpOnly: true,
      secure: this._config.isProduction,
      sameSite: 'lax' as const,
    }

    // Overwrite the cookies with an immediate expiration date
    res.clearCookie('refresh_token', cookieOptions)
    res.clearCookie('access_token', cookieOptions)
  }

  // Sessions
  @Get('sessions')
  async getSessions(
    @CurrentAuth() auth: AuthContext
  ): Promise<GetActiveSessionsResponseDto> {
    return await this.getSessionsUseCase.execute({
      sid: auth.sessionId,
      userId: auth.userId,
    })
  }
}
