import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AUTH_SERVICE, type IAuthService } from '../application'
import { SignInRequestDto, SignInResponseDto } from './dtos'
import { CurrentUser } from '@/shared/presentation/decorators/current-user.decorator'
import { User } from '@/modules/user/domain'
import { type Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import { ApiOkResponseGeneric } from '@/shared/infrastructure/decorators/api-ok-response.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService,
    private readonly _config: ConfigService
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignInRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account registered successfully',
    type: SignInResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Account with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseGuards(AuthGuard('local'))
  @ApiOkResponseGeneric({ type: SignInResponseDto })
  async signIn(
    @CurrentUser() currentUser: User,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignInResponseDto> {
    const { user, tokens, sessionId } = await this._authService.signIn(
      currentUser,
      {
        ipAddress,
        userAgent,
      }
    )

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
