import { Inject, Injectable, Logger } from '@nestjs/common'
import {
  InvalidRefreshTokenException,
  RefreshTokenMismatchException,
  RefreshTokenNotFoundException,
  SessionNotFoundException,
  UserAgentMisMatchException,
} from '../../domain/exceptions/auth.exception'
import { IRefreshTokenUseCase } from './refresh-token.interface'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  AccountInactiveException,
  Email,
  UserNotFoundException,
  UserStatus,
} from '@/modules/user/domain'
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'

@Injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  private readonly _logger = new Logger(RefreshTokenUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}
  async execute(dto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    if (!dto.token) throw new RefreshTokenNotFoundException()

    const tokenResult = await this._authService.verifyRefreshToken(dto.token)

    if (!tokenResult) throw new InvalidRefreshTokenException()

    const session = await this._authService.getAuthSession(tokenResult.sid)

    if (!session) throw new SessionNotFoundException(tokenResult.sid)

    if (session.jti !== tokenResult.jti) {
      await this._authService.invalidateAuthSession(session.sessionId)
      throw new RefreshTokenMismatchException()
    }

    if (session.userAgent !== dto.clientInfo.userAgent) {
      await this._authService.invalidateAuthSession(session.sessionId)
      throw new UserAgentMisMatchException()
    }

    const userEmail = Email.create(session.email)

    const user = await this._userRepository.findByEmail(userEmail.value)

    if (!user) {
      await this._authService.invalidateAuthSession(session.sessionId)
      throw new UserNotFoundException(session.userId)
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this._authService.invalidateAuthSession(session.sessionId)
      throw new AccountInactiveException(user.status)
    }

    const refreshTokenId = this._authService.createRefreshTokenId()

    await this._authService.extendAuthSession(session.sessionId, {
      jti: refreshTokenId,
      ipAddress: dto.clientInfo.ipAddress,
    })

    const accessToken = await this._authService.createAccessToken({
      jti: this._authService.createAccessTokenId(),
      sid: session.sessionId,
      sub: user.id.value,
      email: user.email.value,
    })

    const refreshToken = await this._authService.createRefreshToken({
      jti: refreshTokenId,
      sid: session.sessionId,
      sub: user.id.value,
    })

    this._logger.log(`User ${user.id.value} refresh access token successfully`)

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt:
        this._authService.extractAccessTokenExpiry(accessToken),
      refreshTokenExpiresAt:
        this._authService.extractRefreshTokenExpiry(refreshToken),
    }
  }
}
