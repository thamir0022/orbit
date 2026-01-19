import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs'
import { SignInCommand } from './sign-in.command'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application/ports/repository/user.repository.interface'
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from '../../ports/services/password-hasher.interface'
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TOKEN_GENERATOR,
  type ITokenGenerator,
} from '../../ports/services/token-generator.interface'
import {
  SESSION_MANAGER,
  type ISessionManager,
} from '../../ports/services/session-manager.interface'
import { Email } from '@/modules/user/domain'
import { UserStatus } from '@/modules/user/domain'
import {
  InvalidCredentialsException,
  AccountLockedException,
  AccountInactiveException,
} from '@/modules/user/domain'
import type { UserResponseDto } from '../../dtos/user-response.dto'
import { Inject, Logger } from '@nestjs/common'
import { UserMapper } from '@/modules/user/application/mappers/user.mapper'
import { UuidUtil } from '@/shared/utils'

export interface SignInResult {
  user: UserResponseDto
  tokens: {
    accessToken: string
    refreshToken: string
    refreshTokenExpiresAt: Date
    accessTokenExpiresAt: Date
  }
  sessionId: string
}

/**
 * Sign In Command Handler
 *
 * APPLICATION LAYER - Orchestrates the authentication use case
 *
 * This handler demonstrates proper Clean Architecture:
 * - Uses PORTS (interfaces) to interact with infrastructure
 * - Domain entity handles business rules (isLocked, recordLogin)
 * - Infrastructure concerns (hashing, tokens, sessions) are abstracted
 */

@CommandHandler(SignInCommand)
export class SignInHandler implements ICommandHandler<
  SignInCommand,
  SignInResult
> {
  private readonly logger = new Logger(SignInHandler.name)
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly _tokenGenerator: ITokenGenerator,
    @Inject(SESSION_MANAGER)
    private readonly _sessionManager: ISessionManager,
    private readonly _eventBus: EventBus
  ) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    this.logger.log(`Processing sign-in for email: ${command.email}`)

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

    // 5. Verify password (via Password Hasher Port)
    if (!user.passwordHash) throw new InvalidCredentialsException()

    const isPasswordValid = await this._passwordHasher.compare(
      command.password,
      user.passwordHash.value
    )

    if (!isPasswordValid) {
      // Domain behavior: record failed login
      user.recordFailedLogin()
      await this._userRepository.save(user)
      throw new InvalidCredentialsException()
    }

    // 6. Record successful login (Domain behavior)
    user.recordLogin()

    // 7. Save the user
    await this._userRepository.save(user)

    const refreshTokenId = UuidUtil.generate()

    const sessionId = await this._sessionManager.createSession({
      userId: user.id.value,
      jti: refreshTokenId,
      email: user.email.value,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
    })

    const accessToken = this._tokenGenerator.generateAccessToken({
      jti: UuidUtil.generate(),
      sub: user.id.value,
      sid: sessionId,
      email: user.email.value,
    })

    const refreshToken = this._tokenGenerator.generateRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: sessionId,
    })

    const now = Date.now()

    const refreshTokenExpiresAt = this._tokenGenerator.refreshTokenTTL(now)
    const accessTokenExpiresAt = this._tokenGenerator.accessTokenTTL(now)

    // 10. Publish domain events
    const events = user.domainEvents
    events.forEach((event) => this._eventBus.publish(event))
    user.clearEvents()

    // 10. Return result (Application DTO)
    return {
      user: UserMapper.toResponseDto(user),
      tokens: {
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
        accessTokenExpiresAt,
      },
      sessionId,
    }
  }
}
