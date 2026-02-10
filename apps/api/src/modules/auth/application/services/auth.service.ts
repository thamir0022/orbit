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
import { ConfigService } from '@nestjs/config'
import {
  Email,
  User,
  UserStatus,
  AccountLockedException,
  AccountInactiveException,
  InvalidCredentialsException,
} from '@/modules/user/domain'
import { type IAuthService } from './auth.service.interface'

@Injectable()
export class AuthService implements IAuthService {
  private readonly _logger = new Logger(AuthService.name)

  constructor(
    @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
    private readonly _config: ConfigService
  ) {}

  /**
   * VALIDATION
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
}
