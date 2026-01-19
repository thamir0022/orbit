import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { Inject, Logger } from '@nestjs/common'
import { SignUpCommand } from './sign-up.command'
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application/ports/repository/user.repository.interface'
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../ports/services/password-hasher.interface'
import {
  Email,
  EmailAlreadyExistsException,
  InvalidEmailException,
  InvalidPasswordException,
  Password,
  User,
} from '@/modules/user/domain'
import {
  ITokenGenerator,
  TOKEN_GENERATOR,
} from '../../ports/services/token-generator.interface'
import {
  ISessionManager,
  SESSION_MANAGER,
} from '../../ports/services/session-manager.interface'
import { UserResponseDto } from '../../dtos/user-response.dto'
import { UserMapper } from '@/modules/user/application/mappers/user.mapper'
import { UuidUtil } from '@/shared/utils'

export interface SignUpResult {
  user: UserResponseDto
  tokens: {
    accessToken: string
    refreshToken: string
    accessTokenExpiresAt: Date
    refreshTokenExpiresAt: Date
  }
  sessionId: string
}

@CommandHandler(SignUpCommand)
export class SignUpHandler implements ICommandHandler<
  SignUpCommand,
  SignUpResult
> {
  private readonly _logger = new Logger(SignUpHandler.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly _tokenGenerator: ITokenGenerator,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
    @Inject(SESSION_MANAGER)
    private readonly _sessionManager: ISessionManager,
    private readonly _eventBus: EventBus
  ) {}

  async execute(command: SignUpCommand): Promise<SignUpResult> {
    this._logger.log(`Processing sign-up for email: ${command.email}`)

    // 1. Create and validate email value object (Domain validation)
    const emailResult = Email.create(command.email)
    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const email = emailResult.value

    // 2. Check if user already exists (Application rule via Port)
    const existingUser = await this._userRepository.existsByEmail(email)
    if (existingUser) throw new EmailAlreadyExistsException(email.value)

    // 3. Create and validate password value object (Domain validation)
    const passwordResult = Password.create(command.password)
    if (passwordResult.isFailure)
      throw new InvalidPasswordException(passwordResult.error)

    // 4. Hash the password (Infrastructure concern via Port)
    const hashedPassword = await this._passwordHasher.hash(command.password)
    const password = Password.fromHashed(hashedPassword)

    // 5. Create user aggregate (Domain factory)
    const user = User.create({
      firstName: command.firstName,
      lastName: command.lastName,
      email: email,
      passwordHash: password,
    })

    // 6. Persist user (Infrastructure concern via Port)
    const savedUser = await this._userRepository.save(user)

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
      sid: user.id.value,
    })

    const now = Date.now()

    const refreshTokenExpiresAt = this._tokenGenerator.refreshTokenTTL(now)
    const accessTokenExpiresAt = this._tokenGenerator.refreshTokenTTL(now)

    // 9. Publish domain events
    const events = savedUser.domainEvents
    events.forEach((event) => this._eventBus.publish(event))
    savedUser.clearEvents()

    // 10. Map to response DTO (Application concern)
    return {
      user: UserMapper.toResponseDto(savedUser),
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
