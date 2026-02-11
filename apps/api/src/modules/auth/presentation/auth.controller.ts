import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Ip,
  Post,
  Res,
} from '@nestjs/common'
import {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
} from './dtos'
import type { Response } from 'express'
import { ConfigService } from '@nestjs/config'
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
  type IRefreshTokenInterface,
  REFRESH_TOKEN,
} from '../application/usecases/refresh-token.interface'
import { RefreshTokenResponseDto } from './dtos/refresh-token.response.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SIGN_IN_WITH_EMAIL)
    private readonly _signInWithEmailUseCase: ISignInWithEmailUseCase,
    @Inject(SIGN_UP_WITH_EMAIL)
    private readonly _signUpWithEmailUseCase: ISignUpWithEmailUseCase,
    @Inject(REFRESH_TOKEN)
    private readonly _refreshTokenUseCase: IRefreshTokenInterface,
    private readonly _config: ConfigService
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignInRequestDto })
  @ApiCreatedResponse({
    description: 'Account registered successfully',
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
  async signIn(
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Body() signInRequestDto: SignInRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignInResponseDto> {
    const { user, tokens, sessionId } =
      await this._signInWithEmailUseCase.execute({
        email: signInRequestDto.email,
        password: signInRequestDto.password,
        clientInfo: { ipAddress, userAgent },
      })

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this._config.get<string>('NODE_ENV') === 'production',
      maxAge: this._config.get('JWT_REFRESH_EXPIRES_IN', 604800),
      path: '/api/v1/auth/refresh',
    })

    return {
      user,
      sessionId,
      tokens: {
        accessToken: tokens.accessToken,
        accessTokenExpiresIn: this._config.get('JWT_ACCESS_EXPIRES_IN', 900),
      },
    }
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignUpRequestDto })
  @ApiCreatedResponse({
    description: 'Account sign up succesfull',
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
  async signUp(
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Body() signUpRequestDto: SignUpRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignUpResponseDto> {
    const { user, tokens, sessionId } =
      await this._signUpWithEmailUseCase.execute({
        firstName: signUpRequestDto.firstName,
        lastName: signUpRequestDto.lastName,
        email: signUpRequestDto.email,
        password: signUpRequestDto.password,
        clientInfo: { ipAddress, userAgent },
      })

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this._config.get<string>('NODE_ENV') === 'production',
      maxAge: this._config.get('JWT_REFRESH_EXPIRES_IN', 604800),
      path: '/api/v1/auth/refresh',
    })

    return {
      user,
      sessionId,
      tokens: {
        accessToken: tokens.accessToken,
        accessTokenExpiresIn: this._config.get('JWT_ACCESS_EXPIRES_IN', 900),
      },
    }
  }

  @Get('refresh')
  async refresh(
    @Headers('user-agent') userAgent: string,
    @Cookies('refresh_token') refreshToken: string,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshTokenResponseDto> {
    const { user, tokens, sessionId } = await this._refreshTokenUseCase.execute(
      {
        refreshToken,
        clientInfo: {
          ipAddress,
          userAgent,
        },
      }
    )

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this._config.get<string>('NODE_ENV') === 'production',
      maxAge: this._config.get('JWT_REFRESH_EXPIRES_IN', 604800),
      path: '/api/v1/auth/refresh',
    })

    return {
      user,
      sessionId,
      tokens: {
        accessToken: tokens.accessToken,
        accessTokenExpiresIn: this._config.get('JWT_ACCESS_EXPIRES_IN', 900),
      },
    }
  }
}
