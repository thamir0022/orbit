import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { CurrentUserCommand } from '../dto/current-user.command'
import { CurrentUserResult } from '../dto/current-user.result'
import { IGetCurrentUserUseCase } from './get-current-user.interface'
import {
  type ISessionManager,
  type ITokenGenerator,
  SESSION_MANAGER,
  TOKEN_GENERATOR,
} from '@/modules/auth/application'
import {
  InvalidRefreshTokenException,
  RefreshTokenMismatchException,
  SessionNotFoundException,
} from '@/modules/auth/domain/exceptions/auth.exception'
import {
  AccountInactiveException,
  Email,
  InvalidEmailException,
  UserNotFoundException,
  UserStatus,
} from '../../domain'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../repository/user.repository.interface'
import { UuidUtil } from '@/shared/utils'
import { UserMapper } from '../mappers/user.mapper'

@Injectable()
export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  constructor(
    @Inject(TOKEN_GENERATOR)
    private readonly _tokenGenerator: ITokenGenerator,
    @Inject(SESSION_MANAGER)
    private readonly _sessionManager: ISessionManager,
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository
  ) {}
  async execute({
    refreshToken,
    clientInfo,
  }: CurrentUserCommand): Promise<CurrentUserResult> {
    if (!refreshToken) throw new UnauthorizedException()

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

    const userEmailResult = Email.create(session.email)

    if (userEmailResult.isFailure) {
      await this._sessionManager.invalidateSession(tokenResult.sid)
      throw new InvalidEmailException(userEmailResult.error)
    }

    const user = await this._userRepository.findByEmail(userEmailResult.value)

    if (!user) {
      await this._sessionManager.invalidateSession(session.sessionId)
      throw new UserNotFoundException(session.userId)
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this._sessionManager.invalidateSession(session.sessionId)
      throw new AccountInactiveException(user.status)
    }

    const accessToken = this._tokenGenerator.generateAccessToken({
      jti: UuidUtil.generate(),
      sid: session.sessionId,
      sub: user.id.value,
      email: user.email.value,
    })

    return {
      user: UserMapper.toResponseDto(user),
      accessToken,
    }
  }
}
