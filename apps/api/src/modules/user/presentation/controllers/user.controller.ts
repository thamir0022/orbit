import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
} from '@nestjs/common'
import { type Response } from 'express'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SignUpCommand } from '@/modules/user/application'
import { SignInCommand } from '@/modules/user/application'
import {
  SignUpRequestDto,
  SignInResponseDto,
  SignInRequestDto,
  SignUpResponseDto,
} from '../dtos/'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignUpRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: SignUpResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async signUp(@Body() dto: SignUpRequestDto): Promise<SignUpResponseDto> {
    const command = new SignUpCommand(
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.password
    )

    const user = await this.commandBus.execute(command)

    return {
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: user,
    }
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiBody({ type: SignInRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User authenticated successfully',
    type: SignInResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Account locked or inactive',
  })
  async signIn(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
    @Body()
    dto: SignInRequestDto
  ): Promise<SignInResponseDto> {
    const command = new SignInCommand(dto.email, dto.password, ip, userAgent)

    const result = await this.commandBus.execute(command)
    const { accessToken, refreshToken } = result.tokens

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    return {
      success: true,
      message: 'Sign in successful',
      data: result.user,
      accessToken: accessToken,
      sessionId: result.sessionId,
    }
  }
}
