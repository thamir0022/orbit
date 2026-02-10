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
import {
  AccountInactiveException,
  AccountLockedException,
  Email,
  InvalidCredentialsException,
  UserStatus,
} from '@/modules/user/domain'
import { formatDistanceToNow } from 'date-fns'

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

  async excecute({
    email,
    password,
    clientInfo,
  }: SignInCommand): Promise<SignInResult> {
    this._logger.log(`Validating credentials for: ${email}`)

    // 1. Domain Validation
    const emailResult = Email.create(email)
    if (emailResult.isFailure) throw new InvalidCredentialsException()

    // 2. Repository Lookup
    const user = await this._userRepository.findByEmail(emailResult.value)
    if (!user) throw new InvalidCredentialsException()

    // 3. Business Rules Check
    if (user.isLocked())
      throw new AccountLockedException(formatDistanceToNow(user.lockedUntil!))
    if (user.status !== UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

    if (!user.passwordHash) throw new InvalidCredentialsException()

    // 4. Password Check
    const isValid = await this._passwordHasher.compare(
      password,
      user.passwordHash.value
    )

    if (!isValid) {
      user.recordFailedLogin()
      await this._userRepository.save(user)
      throw new InvalidCredentialsException()
    }

    // 5. Record successful login (Domain behavior)
    user.recordLogin()

    // 6. Save the user
    await this._userRepository.save(user)

    // 7. Generate a refresh token ID
    const refreshTokenId = UuidUtil.generate()

    // 9. Create session
    const sessionId = await this._sessionManager.createSession({
      userId: user.id.value,
      jti: refreshTokenId,
      email: user.email.value,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    // 10. Generate access token
    const accessToken = this._tokenGenerator.generateAccessToken({
      jti: UuidUtil.generate(),
      sub: user.id.value,
      sid: sessionId,
      email: user.email.value,
    })

    // 11. Generate refresh token
    const refreshToken = this._tokenGenerator.generateRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: sessionId,
    })

    this._logger.log(`User ${user.id.value} sign in successfully`)

    // 12. Return the data
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
