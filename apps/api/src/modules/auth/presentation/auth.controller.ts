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
import {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
} from './dtos'
import type { Response } from 'express'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger'
import {
  type ISignInWithEmailUseCase,
  SIGN_IN_WITH_EMAIL,
} from '../application/usecases/sign-in-with-email.interface'
import {
  type ISignUpWithEmailUseCase,
  SIGN_UP_WITH_EMAIL,
} from '../application/usecases/sign-up-with-email.interface'
import { ApiResponseDto } from '@/shared/presentation/dtos/api-response.dto'
import { Cookies } from '@/shared/presentation/decorators/cookie.decorator'
import {
  type IRefreshTokenUseCase,
  REFRESH_TOKEN,
} from '../application/usecases/refresh-token.interface'
import { RefreshTokenResponseDto } from './dtos/refresh-token.response.dto'
import {
  type IJwtConfig,
  JWT_CONFIG,
} from '../infrastructure/interfaces/jwt.config.interface'
import {
  type IPasswordResetRequestUseCase,
  PASSWORD_RESET_REQUEST,
} from '../application/usecases/password-reset-request.interface'
import { RequestPasswordResetRequestDto } from './dtos/request-password-reset.request.dto'
import {
  PASSWORD_RESET_VERIFY,
  type IPasswordResetVerifyUseCase,
} from '../application/usecases/password-reset-verify.interface'
import { VerifyPasswordResetRequestDto } from './dtos/verify-password-reset.request.dto'
import { VerifyPasswordResetResponseDto } from './dtos/verify-password-reset.response.dto'
import { ConfirmPasswordResetRequestDto } from './dtos/confirm-password-reset.request.dto'
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
import { ResponseMessage as Messages } from './enums/response-messages.enum'
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly _logger = new Logger(AuthController.name)
  constructor(
    @Inject(SIGN_IN_WITH_EMAIL)
    private readonly _signInWithEmailUseCase: ISignInWithEmailUseCase,
    @Inject(SIGN_UP_WITH_EMAIL)
    private readonly _signUpWithEmailUseCase: ISignUpWithEmailUseCase,
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
    type: ApiResponseDto<SignInResponseDto>,
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    type: ApiResponseDto<null>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ApiResponseDto<null>,
  })
  @ResponseMessage(Messages.SIGN_IN)
  async signIn(
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Body() signInRequestDto: SignInRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<null> {
    const { refreshToken } = await this._signInWithEmailUseCase.execute({
      email: signInRequestDto.email,
      password: signInRequestDto.password,
      clientInfo: { ipAddress, userAgent },
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this._config.isProduction,
      maxAge: this._config.refreshTokenExpiresIn * 1000,
    })

    return null
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignUpRequestDto })
  @ApiCreatedResponse({
    description: 'Account sign up successfull',
    type: ApiResponseDto<SignUpResponseDto>,
  })
  @ApiConflictResponse({
    description: 'Account already exist',
    type: ApiResponseDto<null>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ApiResponseDto<null>,
  })
  @ResponseMessage('this is a message from, decorator')
  @ResponseMessage(Messages.SIGN_UP)
  async signUp(
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Body() signUpRequestDto: SignUpRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<null> {
    const { refreshToken } = await this._signUpWithEmailUseCase.execute({
      firstName: signUpRequestDto.firstName,
      lastName: signUpRequestDto.lastName,
      email: signUpRequestDto.email,
      password: signUpRequestDto.password,
      clientInfo: { ipAddress, userAgent },
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this._config.isProduction,
      maxAge: this._config.refreshTokenExpiresIn * 1000,
    })

    return null
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.REFRESH_TOKEN)
  async refresh(
    @Headers('user-agent') userAgent: string,
    @Cookies('refresh_token') refreshToken: string,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshTokenResponseDto> {
    const { tokens } = await this._refreshTokenUseCase.execute({
      refreshToken,
      clientInfo: {
        ipAddress,
        userAgent,
      },
    })

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this._config.isProduction,
      maxAge: this._config.refreshTokenExpiresIn * 1000,
    })

    return { accessToken: tokens.accessToken }
  }

  @Post('reset-password/request')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.OTP_SENT)
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetRequestDto
  ): Promise<null> {
    await this._passwordResetRequestUseCase.execute({
      email: requestPasswordResetDto.email,
    })

    return null
  }

  @Post('reset-password/verify')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.OTP_VERIFIED)
  async verifyPasswordReset(
    @Body() verifyPasswordResetDto: VerifyPasswordResetRequestDto
  ): Promise<VerifyPasswordResetResponseDto> {
    const { resetToken } = await this._passwordResetVerifyUseCase.execute({
      email: verifyPasswordResetDto.email,
      otp: verifyPasswordResetDto.otp,
    })

    return { resetToken }
  }

  @Post('/reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.PASSWORD_RESET_SUCCESS)
  async confirmPasswordReset(
    @Body() confirmPasswordResetRequestDto: ConfirmPasswordResetRequestDto
  ): Promise<null> {
    await this._passwordResetConfirmUseCase.execute({
      resetToken: confirmPasswordResetRequestDto.resetToken,
      newPassword: confirmPasswordResetRequestDto.newPassword,
    })

    return null
  }

  @Get('oauth/:provider')
  @HttpCode(HttpStatus.TEMPORARY_REDIRECT)
  @ResponseMessage(Messages.OAUTH_LOGIN)
  authenticateWithOAuth(
    @Param('provider', new ParseEnumPipe(AuthProvider)) provider: AuthProvider,
    @Res() res: Response
  ) {
    const url = this._authenticateWithOAuthUseCase.getRedirectUrl(provider)
    return res.redirect(url)
  }

  @Get('oauth/:provider/callback')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.OAUTH_VERIFIED)
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
    const { refreshToken } = await this._authenticateWithOAuthUseCase.execute({
      code,
      provider,
      clientInfo: {
        userAgent,
        ipAddress,
      },
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this._config.isProduction,
      maxAge: this._config.refreshTokenExpiresIn * 1000,
    })

    return res.redirect(`${this._config.frontEndUrl}`)
  }
}
