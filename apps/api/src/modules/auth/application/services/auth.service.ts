// application/services/auth.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../repositories/password-hasher.interface'
import {
  type ISessionManager,
  SESSION_MANAGER,
} from '../repositories/session-manager.interface'
import {
  type ITokenGenerator,
  TOKEN_GENERATOR,
} from '../repositories/token-generator.interface'
import { ConfigService } from '@nestjs/config'
import {
  Email,
  User,
  UserStatus,
  AccountLockedException,
  AccountInactiveException,
  InvalidCredentialsException,
} from '@/modules/user/domain'
import { UserMapper } from '@/modules/user/application/mappers/user.mapper'
import { UuidUtil } from '@/shared/utils'
import { SignInResult } from '../dto/sign-in.result'
import { ClientInfo, IAuthService } from './auth.service.interface'

@Injectable()
export class AuthService implements IAuthService {
  private readonly _logger = new Logger(AuthService.name)

  constructor(
    @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
    @Inject(SESSION_MANAGER) private readonly _sessionManager: ISessionManager,
    @Inject(TOKEN_GENERATOR) private readonly _tokenGenerator: ITokenGenerator,
    private readonly _config: ConfigService
  ) {}

  /**
   * STEP 1: VALIDATION
   * Called by LocalStrategy to verify credentials.
   * Returns the User Entity if valid, or throws if invalid.
   */
  async validateUser(email: string, password: string): Promise<User> {
    this._logger.log(`Validating credentials for: ${email}`)

    // 1. Domain Validation
    const emailResult = Email.create(email)
    if (emailResult.isFailure) throw new InvalidCredentialsException()

    // 2. Repository Lookup
    const user = await this._userRepository.findByEmail(emailResult.value)
    if (!user) throw new InvalidCredentialsException()

    // 3. Business Rules Check
    if (user.isLocked()) throw new AccountLockedException(user.lockedUntil!)
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

    // 5. Success - Return User Entity for the Request Context
    return user
  }

  /**
   * STEP 2: SESSION CREATION
   * Called by AuthController after LocalGuard succeeds.
   * Generates Tokens and Session.
   */
  async signIn(user: User, clientInfo: ClientInfo): Promise<SignInResult> {
    this._logger.log(`Generating session for user: ${user.id.value}`)

    // 1. Domain Event: Record Login
    user.recordLogin()
    await this._userRepository.save(user)

    // 2. Generate IDs
    const refreshTokenId = UuidUtil.generate()

    // 3. Persist Session
    const sessionId = await this._sessionManager.createSession({
      userId: user.id.value,
      jti: refreshTokenId,
      email: user.email.value,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    this._logger.debug('helloo', sessionId)

    // 4. Generate JWTs
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

    // 5. Return Result DTO
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
