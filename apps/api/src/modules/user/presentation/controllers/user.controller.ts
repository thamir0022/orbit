import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  SignInResponseDto,
  SignUpRequestDto,
} from '@/modules/user/presentation'
import { SignUpCommand } from '@/modules/user/application'
import { SignUpResponseDto } from '@/modules/user/presentation'
import { SignInRequestDto } from '@/modules/user/presentation'
import { SignInCommand } from '@/modules/user/application'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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
    @Body()
    dto: SignInRequestDto
  ): Promise<SignInResponseDto> {
    const command = new SignInCommand(dto.email, dto.password, ip)

    const result = await this.commandBus.execute(command)

    return {
      success: true,
      message: 'Sign in successful',
      data: result.user,
      tokens: result.tokens,
      sessionId: result.sessionId,
    }
  }
}
