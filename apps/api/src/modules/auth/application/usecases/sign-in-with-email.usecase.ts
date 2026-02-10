import { Inject, Logger } from '@nestjs/common'
import { SignInCommand } from '../dto/sign-in.command'
import { SignInResult } from '../dto/sign-in.result'
import { ISignInWithEmailUseCase } from './sign-in-with-email.interface'
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/modules/user/application'
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from '../repositories/password-hasher.interface'
import { UuidUtil } from '@/shared/utils'
import {
  type ISessionManager,
  SESSION_MANAGER,
} from '../repositories/session-manager.interface'
import {
  type ITokenGenerator,
  TOKEN_GENERATOR,
} from '../repositories/token-generator.interface'
import { UserMapper } from '@/modules/user/application/mappers/user.mapper'

export class SignInWithEmailUseCase implements ISignInWithEmailUseCase {
  private readonly _logger = new Logger(SignInWithEmailUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
    @Inject(SESSION_MANAGER)
    private readonly _sessionManager: ISessionManager,
    @Inject(TOKEN_GENERATOR)
    private readonly _tokenGenerator: ITokenGenerator
  ) {}

  async excecute({ user, clientInfo }: SignInCommand): Promise<SignInResult> {
    // 1. Record successful login (Domain behavior)
    user.recordLogin()

    // 2. Save the user
    await this._userRepository.save(user)

    // 3. Generate a refresh token ID
    const refreshTokenId = UuidUtil.generate()

    // 4. Create session
    const sessionId = await this._sessionManager.createSession({
      userId: user.id.value,
      jti: refreshTokenId,
      email: user.email.value,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    // 5. Generate access token
    const accessToken = this._tokenGenerator.generateAccessToken({
      jti: UuidUtil.generate(),
      sub: user.id.value,
      sid: sessionId,
      email: user.email.value,
    })

    // 6. Generate refresh token
    const refreshToken = this._tokenGenerator.generateRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: sessionId,
    })

    this._logger.log(`User ${user.id.value} sign in successfully`)

    // 7. Return the data
    return {
      tokens: {
        accessToken,
        refreshToken,
      },
      sessionId,
      user: UserMapper.toResponseDto(user),
    }
  }
}
