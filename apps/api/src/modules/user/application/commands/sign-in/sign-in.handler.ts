import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs'
import { SignInCommand } from './sign-in.command'
import type { IUserRepository } from '@/modules/user/application'
import type { IPasswordHasher } from '@/modules/user/application'
import type { ITokenGenerator } from '@/modules/user/application'
import type { ISessionManager } from '@/modules/user/application'
import { Email } from '@/modules/user/domain'
import { UserStatus } from '@/modules/user/domain'
import {
  InvalidCredentialsException,
  AccountLockedException,
  AccountInactiveException,
} from '@/modules/user/domain'
import {
  PASSWORD_HASHER,
  SESSION_MANAGER,
  TOKEN_GENERATOR,
  USER_REPOSITORY,
  UserMapper,
} from '@/modules/user/application'
import type { UserResponseDto } from '@/modules/user/application'
import { Inject, Logger } from '@nestjs/common'

export interface SignInResult {
  user: UserResponseDto
  tokens: {
    accessToken: string
    refreshToken: string
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
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: ITokenGenerator,
    @Inject(SESSION_MANAGER)
    private readonly sessionManager: ISessionManager,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    this.logger.log(`Processing sign-in for email: ${command.email}`)

    // 1. Validate and create Email value object (Domain)
    const emailResult = Email.create(command.email)
    if (emailResult.isFailure) throw new InvalidCredentialsException()

    const email = emailResult.value

    // 2. Find user by email (via Repository Port)
    const user = await this.userRepository.findByEmail(email)
    if (!user) throw new InvalidCredentialsException()

    // 3. Check if account is locked (Domain business rule)
    if (user.isLocked()) throw new AccountLockedException(user.lockedUntil!)

    // 4. Check account status (Domain business rule)
    if (user.status !== UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

    // 5. Verify password (via Password Hasher Port)
    if (!user.passwordHash) throw new InvalidCredentialsException()

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash.value
    )

    if (!isPasswordValid) {
      // Domain behavior: record failed login
      user.recordFailedLogin()
      await this.userRepository.save(user)
      throw new InvalidCredentialsException()
    }

    // 6. Record successful login (Domain behavior)
    user.recordLogin()

    // 7. Save the user
    await this.userRepository.save(user)

    // 8. Generate token pair (via Token Generator Port)
    const tokenPayload = {
      userId: user.userId.value,
      email: user.email.value,
    }

    const accessToken = this.tokenGenerator.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenGenerator.generateRefreshToken(tokenPayload)

    // 9. Create session in Redis (via Session Manager Port)
    const sessionId = await this.sessionManager.createSession({
      userId: user.userId.value,
      email: user.email.value,
      accessToken,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    // 10. Publish domain events
    const events = user.domainEvents
    events.forEach((event) => this.eventBus.publish(event))
    user.clearEvents()

    this.logger.log(`User signed in successfully: ${user.userId.value}`)

    // 10. Return result (Application DTO)
    return {
      user: UserMapper.toResponseDto(user),
      tokens: {
        accessToken,
        refreshToken,
      },
      sessionId,
    }
  }
}
