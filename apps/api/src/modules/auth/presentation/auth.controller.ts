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
import { SignInRequestDto, SignInResponseDto } from './dtos'
import { CurrentUser } from '@/shared/presentation/decorators/current-user.decorator'
import { User } from '@/modules/user/domain'
import { type Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ApiOkResponseGeneric } from '@/shared/infrastructure/decorators/api-ok-response.decorator'
import {
  SIGN_IN_WITH_EMAIL,
  type ISignInWithEmailUseCase,
} from '../application/usecases/sign-in-with-email.interface'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SIGN_IN_WITH_EMAIL)
    private readonly _signInWithEmailUseCase: ISignInWithEmailUseCase,
    private readonly _config: ConfigService
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignInRequestDto })
  @ApiCreatedResponse({
    description: 'Account registered successfully',
    type: SignInResponseDto,
  })
  @ApiConflictResponse({
    description: 'Account with this email already exists',
  })
  @ApiBadRequestResponse({
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
    const { user, tokens, sessionId } =
      await this._signInWithEmailUseCase.excecute({
        user: currentUser,
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
