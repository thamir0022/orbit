import { Inject, Logger } from '@nestjs/common'
import { RefreshTokenCommand } from '../dto/refresh-token.command'
import {
  type ITokenGenerator,
  TOKEN_GENERATOR,
} from '../repositories/token-generator.interface'
import {
  InvalidRefreshTokenException,
  RefreshTokenMismatchException,
  RefreshTokenNotFoundException,
  SessionNotFoundException,
} from '../../domain/exceptions/auth.exception'
import { IRefreshTokenUseCase } from './refresh-token.interface'
import { RefreshTokenResult } from '../dto/refresh-token.result'
import {
  type ISessionManager,
  SESSION_MANAGER,
} from '../repositories/session-manager.interface'
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
import { UuidUtil } from '@/shared/utils'
import { addSeconds } from 'date-fns'
import { UserMapper } from '@/modules/user/application/mappers/user.mapper'
import {
  JWT_CONFIG,
  type IJwtConfig,
} from '../../infrastructure/interfaces/jwt.config.interface'

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  private readonly _logger = new Logger(RefreshTokenUseCase.name)

  constructor(
    @Inject(SESSION_MANAGER)
    private readonly _sessionManager: ISessionManager,
    @Inject(TOKEN_GENERATOR)
    private readonly _tokenGenerator: ITokenGenerator,
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(JWT_CONFIG)
    private readonly _config: IJwtConfig
  ) {}
  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const { refreshToken, clientInfo } = command

    if (!refreshToken) throw new RefreshTokenNotFoundException()

    const tokenResult = this._tokenGenerator.verifyRefreshToken(refreshToken)

    if (!tokenResult) throw new InvalidRefreshTokenException()

    const session = await this._sessionManager.getSession(tokenResult.sid)

    if (!session) throw new SessionNotFoundException(tokenResult.sid)

    if (session.jti !== tokenResult.jti) {
      await this._sessionManager.invalidateSession(session.sessionId)
      throw new RefreshTokenMismatchException()
    }

    if (session.userAgent !== clientInfo.userAgent) {
      await this._sessionManager.invalidateSession(session.sessionId)
      throw new RefreshTokenMismatchException()
    }

    const userEmail = Email.create(session.email)

    const user = await this._userRepository.findByEmail(userEmail.value)

    if (!user) {
      await this._sessionManager.invalidateSession(session.sessionId)
      throw new UserNotFoundException(session.userId)
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this._sessionManager.invalidateSession(session.sessionId)
      throw new AccountInactiveException(user.status)
    }

    const refreshTokenId = UuidUtil.generate()

    await this._sessionManager.extendSession({
      sessionId: session.sessionId,
      updates: {
        jti: refreshTokenId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      },
      expiresAt: addSeconds(new Date(), this._config.refreshTokenExpiresIn),
    })

    const newAccessToken = this._tokenGenerator.generateAccessToken({
      jti: UuidUtil.generate(),
      sid: session.sessionId,
      sub: user.id.value,
      email: user.email.value,
    })

    const newRefreshToken = this._tokenGenerator.generateRefreshToken({
      jti: refreshTokenId,
      sid: session.sessionId,
      sub: user.id.value,
    })

    this._logger.log(`User ${user.id.value} refresh access token successfully`)

    return {
      user: UserMapper.toResponseDto(user),
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      sessionId: session.sessionId,
    }
  }
}
