import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
} from '../dtos'
import { SignUpCommand } from '../../application/commands/sign-up/sign-up.command'
import { SignInCommand } from '../../application'
import { RefreshTokenResponseDto } from '../dtos/refresh-token.response.dto'
import { RefreshTokenCommand } from '../../application/commands/refresh-token/refresh-token.command'
import { Cookie } from '@/shared/presentation/decorators/cookie.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly _commandBus: CommandBus,
    private readonly _config: ConfigService
  ) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignUpRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account registered successfully',
    type: SignUpResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Account with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async signUp(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Body() dto: SignUpRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignUpResponseDto> {
    const command = new SignUpCommand(
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.password,
      ipAddress,
      userAgent
    )

    const { user, tokens, sessionId } = await this._commandBus.execute(command)

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this._config.get<string>('NODE_ENV') === 'production',
      sameSite: 'none',
      expires: tokens.refreshTokenExpiresAt,
    })

    return {
      success: true,
      message: 'Account registered successfully',
      data: {
        user,
        accessToken: tokens.accessToken,
        sessionId,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      },
    }
  }

  @Post('sign-in')
  async signIn(
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Body() dto: SignInRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignInResponseDto> {
    const command = new SignInCommand(
      dto.email,
      dto.password,
      ipAddress,
      userAgent
    )

    const { user, tokens, sessionId } = await this._commandBus.execute(command)

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this._config.get<string>('NODE_ENV') === 'production',
      expires: tokens.refreshTokenExpiresAt,
    })

    return {
      success: true,
      message: 'Sign In successfully',
      data: {
        user,
        accessToken: tokens.accessToken,
        sessionId,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      },
    }
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  async refresh(
    @Headers('user-agent') userAgent: string,
    @Cookie('refresh_token') refreshToken: string,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshTokenResponseDto> {
    const command = new RefreshTokenCommand(refreshToken, ipAddress, userAgent)

    const { tokens, sessionId } = await this._commandBus.execute(command)

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this._config.get<string>('NODE_ENV') === 'production',
      expires: tokens.refreshTokenExpiresAt,
    })

    return {
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        sessionId,
      },
    }
  }
}
