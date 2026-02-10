import {
  Body,
  Controller,
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
import { type Response } from 'express'
import { ConfigService } from '@nestjs/config'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SIGN_IN_WITH_EMAIL)
    private readonly _signInWithEmailUseCase: ISignInWithEmailUseCase,
    @Inject(SIGN_UP_WITH_EMAIL)
    private readonly _signUpWithEmailUseCase: ISignUpWithEmailUseCase,
    private readonly _config: ConfigService
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignInRequestDto })
  @ApiCreatedResponse({
    description: 'Account registered successfully',
    type: ApiResponseDto<SignInResponseDto>,
  })
  @ApiConflictResponse({
    description: 'Account with this email already exists',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
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
