import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RefreshTokenCommand } from './refresh-token.command'
import {
  ITokenGenerator,
  TOKEN_GENERATOR,
} from '../../ports/services/token-generator.interface'
import { Inject } from '@nestjs/common'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application/ports/repository/user.repository.interface'
import {
  AccountInactiveException,
  UserId,
  UserNotFoundException,
  UserStatus,
} from '@/modules/user/domain'
import {
  ISessionManager,
  SESSION_MANAGER,
} from '../../ports/services/session-manager.interface'
import {
  InvalidRefreshTokenException,
  RefreshTokenMismatchException,
  SessionNotFoundException,
} from '@/modules/auth/domain/exceptions/auth.exception'
import { UuidUtil } from '@/shared/utils'
import { addSeconds, isBefore } from 'date-fns'
import { ConfigService } from '@nestjs/config'

interface RefreshTokenResult {
  tokens: {
    accessToken: string
    refreshToken: string
    accessTokenExpiresAt: Date
    refreshTokenExpiresAt: Date
  }
  sessionId: string
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<
  RefreshTokenCommand,
  RefreshTokenResult
> {
  constructor(
    @Inject(TOKEN_GENERATOR)
    private readonly _tokenGenerator: ITokenGenerator,
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(SESSION_MANAGER)
    private readonly _sessionManager: ISessionManager,
    private readonly _config: ConfigService
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const tokenPayload = this._tokenGenerator.verifyRefreshToken(
      command._refreshToken
    )

    if (!tokenPayload) throw new InvalidRefreshTokenException()

    const session = await this._sessionManager.getSession(tokenPayload.sid)

    if (!session) throw new SessionNotFoundException(tokenPayload.sid)

    if (isBefore(session.expiresAt, Date.now())) {
      await this._sessionManager.invalidateSession(tokenPayload.sid)
      throw new SessionNotFoundException(tokenPayload.sid)
    }

    if (session.jti !== tokenPayload.jti) {
      await this._sessionManager.invalidateSession(tokenPayload.sid)
      throw new RefreshTokenMismatchException()
    }

    const userId = UserId.create(tokenPayload.sub)

    const user = await this._userRepository.findById(userId)

    if (!user) throw new UserNotFoundException(tokenPayload.sub)

    if (user.status != UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

    const refreshTokenId = UuidUtil.generate()

    const accessToken = this._tokenGenerator.generateAccessToken({
      jti: UuidUtil.generate(),
      sub: user.id.value,
      email: user.email.value,
      sid: session.sessionId,
    })

    const refreshToken = this._tokenGenerator.generateRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: session.sessionId,
    })

    await this._sessionManager.extendSession({
      sessionId: session.sessionId,
      updates: {
        jti: refreshTokenId,
        ipAddress: command._ipAddress,
        userAgent: command._userAgent,
      },
      expiresAt: addSeconds(
        Date.now(),
        this._config.get('SESSION_TTL_SECONDS')
      ),
    })

    const now = Date.now()

    const refreshTokenExpiresAt = this._tokenGenerator.refreshTokenTTL(now)
    const accessTokenExpiresAt = this._tokenGenerator.accessTokenTTL(now)

    return {
      tokens: {
        accessToken,
        accessTokenExpiresAt,
        refreshToken,
        refreshTokenExpiresAt,
      },
      sessionId: session.sessionId,
    }
  }
}
