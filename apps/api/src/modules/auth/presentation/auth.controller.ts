import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Ip,
  Logger,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger'
import {
  type ISignInWithEmailUseCase,
  SIGN_IN_WITH_EMAIL,
} from '../application/usecases/sign-in-with-email.interface'
import { ApiResponseDto } from '@/shared/presentation/dtos/api-response.dto'
import { Cookies } from '@/shared/presentation/decorators/cookie.decorator'
import {
  type IRefreshTokenUseCase,
  REFRESH_TOKEN,
} from '../application/usecases/refresh-token.interface'
import {
  type IJwtConfig,
  JWT_CONFIG,
} from '../infrastructure/interfaces/jwt.config.interface'
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
  SignInRequestDto,
  RefreshTokenResponseDto,
  PasswordResetRequestDto,
  PasswordResetVerifyRequestDto,
  PasswordResetVerifyResponseDto,
  PasswordResetConfirmRequestDto,
  SignUpCompleteRequestDto,
  SignUpInititateWithEmailRequestDto,
  SignUpVerifyEmailWithOtpRequestDto,
  SignUpVerifyEmailWithOtpResponseDto,
  SignUpUserDetailsRequestDto,
  SignUpUserDetailsResponseDto,
  SignUpCompleteResponseDto,
} from '../application/dto'
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly _logger = new Logger(AuthController.name)
  constructor(
    @Inject(SIGN_UP_INITIATE)
    private readonly _signUpInitiateWithEmailUseCase: ISignUpInitiateWithEmailUseCase,
    @Inject(SIGN_UP_VERIFY_EMAIL)
    private readonly _signUpVerifyEmailWithOtpUseCase: ISignUpVerifyEmailWithOtpUseCase,
    @Inject(SIGN_UP_USER_DETAILS)
    private readonly _signUpUserDetails: IUserDetailsUseCase,
    @Inject(SIGN_UP_COMPLETE)
    private readonly _signUpComplete: ISignUpCompleteUseCase,
    @Inject(SIGN_IN_WITH_EMAIL)
    private readonly _signInWithEmailUseCase: ISignInWithEmailUseCase,
    @Inject(REFRESH_TOKEN)
    private readonly _refreshTokenUseCase: IRefreshTokenUseCase,
    @Inject(PASSWORD_RESET_REQUEST)
    private readonly _passwordResetRequestUseCase: IPasswordResetRequestUseCase,
    @Inject(PASSWORD_RESET_VERIFY)
    private readonly _passwordResetVerifyUseCase: IPasswordResetVerifyUseCase,
    @Inject(PASSWORD_RESET_CONFIRM)
    private readonly _passwordResetConfirmUseCase: IPasswordResetConfirmUseCase,
    @Inject(AUTHENTICATE_WITH_OAUTH)
    private readonly _authenticateWithOAuthUseCase: IAuthenticateWithOAuthUseCase,
    @Inject(JWT_CONFIG)
    private readonly _config: IJwtConfig & IAppConfig
  ) {}

  @Post('sign-in')
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
    @Body() signInRequestDto: SignInRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<null> {
    const { refreshToken, expiresIn } =
      await this._signInWithEmailUseCase.execute({
        email: signInRequestDto.email,
        password: signInRequestDto.password,
        clientInfo: { ipAddress, userAgent },
      })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this._config.isProduction,
      expires: expiresIn,
    })

    return null
  }

  @Post('/sign-up/initiate')
  @ResponseMessage(AuthResponseMessage.SIGNUP_INITIATE_SUCCESS)
  async initiateSignUp(
    @Body() signUpInitiateDto: SignUpInititateWithEmailRequestDto
  ): Promise<null> {
    return await this._signUpInitiateWithEmailUseCase.execute({
      email: signUpInitiateDto.email,
    })
  }

  @Post('/sign-up/verify')
  @ResponseMessage(AuthResponseMessage.SIGNUP_VERIFY_SUCCESS)
  async verifyEmailWithOtp(
    @Body() signUpVerifyEmailDto: SignUpVerifyEmailWithOtpRequestDto
  ): Promise<SignUpVerifyEmailWithOtpResponseDto> {
    return await this._signUpVerifyEmailWithOtpUseCase.execute({
      email: signUpVerifyEmailDto.email,
      code: signUpVerifyEmailDto.code,
    })
  }

  @Post('/sign-up/details')
  @ResponseMessage(AuthResponseMessage.SIGNUP_DETAILS_SUCCESS)
  async userDetails(
    @Body() signUpUserDetails: SignUpUserDetailsRequestDto
  ): Promise<SignUpUserDetailsResponseDto> {
    return await this._signUpUserDetails.execute({
      firstName: signUpUserDetails.firstName,
      lastName: signUpUserDetails.lastName,
      password: signUpUserDetails.password,
      registrationToken: signUpUserDetails.registrationToken,
    })
  }

  @Post('/sign-up/complete')
  @ResponseMessage(AuthResponseMessage.SIGNUP_COMPLETE_SUCCESS)
  async createOrganization(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Body() signUpCompleteRequestDto: SignUpCompleteRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<Omit<SignUpCompleteResponseDto, 'refreshToken' | 'expiresIn'>> {
    const { refreshToken, expiresIn, redirectUrl } =
      await this._signUpComplete.execute({
        name: signUpCompleteRequestDto.name,
        subdomain: signUpCompleteRequestDto.subdomain,
        companySize: signUpCompleteRequestDto.companySize,
        companyType: signUpCompleteRequestDto.companyType,
        registrationToken: signUpCompleteRequestDto.registrationToken,
        clientInfo: { ipAddress, userAgent },
      })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this._config.isProduction,
      expires: expiresIn,
    })

    return { redirectUrl }
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.REFRESH_SUCCESS)
  async refresh(
    @Headers('user-agent') userAgent: string,
    @Cookies('refresh_token') token: string,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<
    Omit<RefreshTokenResponseDto, 'refreshToken' | 'refreshTokenExpiresAt'>
  > {
    const {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    } = await this._refreshTokenUseCase.execute({
      token,
      clientInfo: {
        ipAddress,
        userAgent,
      },
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this._config.isProduction,
      expires: refreshTokenExpiresAt,
    })

    return { accessToken, accessTokenExpiresAt }
  }

  @Post('reset-password/request')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.PASSWORD_RESET_REQUEST_SUCCESS)
  async requestPasswordReset(
    @Body() passwordResetRequestDto: PasswordResetRequestDto
  ): Promise<null> {
    await this._passwordResetRequestUseCase.execute({
      email: passwordResetRequestDto.email,
    })

    return null
  }

  @Post('reset-password/verify')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.PASSWORD_RESET_VERIFY_SUCCESS)
  async verifyPasswordReset(
    @Body() passwordResetVerifyRequestDto: PasswordResetVerifyRequestDto
  ): Promise<PasswordResetVerifyResponseDto> {
    return await this._passwordResetVerifyUseCase.execute({
      email: passwordResetVerifyRequestDto.email,
      otp: passwordResetVerifyRequestDto.otp,
    })
  }

  @Post('reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.PASSWORD_RESET_CONFIRM_SUCCESS)
  async confirmPasswordReset(
    @Body() passwordResetConfirmRequestDto: PasswordResetConfirmRequestDto
  ): Promise<null> {
    await this._passwordResetConfirmUseCase.execute({
      resetToken: passwordResetConfirmRequestDto.resetToken,
      newPassword: passwordResetConfirmRequestDto.newPassword,
    })

    return null
  }

  @Get('oauth/:provider')
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
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AuthResponseMessage.OAUTH_VERIFY_SUCCESS)
  async authenticateWithOAuthCallback(
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Param('provider', new ParseEnumPipe(AuthProvider))
    provider: AuthProvider,
    @Query('code') code: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response
  ): Promise<void> {
    if (error) {
      this._logger.error(
        `Failed OAuth verification: ${error}. ${errorDescription ?? ''}`
      )
      throw new BadRequestException(
        'OAuth authentication, failed Please try again!'
      )
    }

    if (!code) throw new BadRequestException('Authorization code is required')
    const { refreshToken, expiresIn } =
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

    return res.redirect(`${this._config.frontEndUrl}`)
  }
}
