import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SignUpRequestDto } from '../dtos/sign-up.request.dto'
import { SignUpCommand } from '../../application/commands/sign-up/sign-up.command'
import { SignUpResponseDto } from '../dtos/sign-up.response.dto'

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
}
