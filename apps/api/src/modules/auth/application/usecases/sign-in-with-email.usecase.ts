import { Inject, Logger } from '@nestjs/common'
import { SignInCommand } from '../dto/sign-in.command'
import { SignInResult } from '../dto/sign-in.result'
import { ISignInWithEmailUseCase } from './sign-in-with-email.interface'
import {
  AccountInactiveException,
  AccountLockedException,
  Email,
  InvalidCredentialsException,
  UserStatus,
} from '@/modules/user/domain'
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
import { ConfigService } from '@nestjs/config'

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
    private readonly _tokenGenerator: ITokenGenerator,
    private readonly _config: ConfigService
  ) {}

  async excecute(command: SignInCommand): Promise<SignInResult> {
    this._logger.log(`Processing sign-in for email: ${command.email}`)

    // 1. Validate and create Email value object (Domain)
    const emailResult = Email.create(command.email)
    if (emailResult.isFailure) throw new InvalidCredentialsException()

    const email = emailResult.value

    // 2. Find user by email (via Repository Port)
    const user = await this._userRepository.findByEmail(email)
    if (!user) throw new InvalidCredentialsException()

    // 3. Check if account is locked (Domain business rule)
    if (user.isLocked()) throw new AccountLockedException(user.lockedUntil!)

    // 4. Check account status (Domain business rule)
    if (user.status !== UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

    if (!user.passwordHash) throw new InvalidCredentialsException()

    // 5. Verify password (via Password Hasher Port)
    const isPasswordValid = await this._passwordHasher.compare(
      command.password,
      user.passwordHash.value
    )

    // 6. If password validation fails record a login attempt and throw exception
    if (!isPasswordValid) {
      user.recordFailedLogin()
      await this._userRepository.save(user)
      throw new InvalidCredentialsException()
    }

    // 7. Record successful login (Domain behavior)
    user.recordLogin()

    // 8. Save the user
    await this._userRepository.save(user)

    // 9. Generate a refresh token ID
    const refreshTokenId = UuidUtil.generate()

    // 10. Create session
    const sessionId = await this._sessionManager.createSession({
      userId: user.id.value,
      jti: refreshTokenId,
      email: user.email.value,
      ipAddress: command.clientInfo.ipAddress,
      userAgent: command.clientInfo.userAgent,
    })

    // 11. Generate access token
    const accessToken = this._tokenGenerator.generateAccessToken({
      jti: UuidUtil.generate(),
      sub: user.id.value,
      sid: sessionId,
      email: user.email.value,
    })

    // 12. Generate refresh token
    const refreshToken = this._tokenGenerator.generateRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: sessionId,
    })

    // 13. Return the data
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
