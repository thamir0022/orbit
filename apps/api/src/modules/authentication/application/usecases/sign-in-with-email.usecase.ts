import { Inject, Injectable, Logger } from '@nestjs/common'
import { formatDistanceToNow } from 'date-fns'
import { type ISignInWithEmailUseCase } from './sign-in-with-email.interface'
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/modules/user/application'
import {
  AccountInactiveException,
  AccountLockedException,
  AuthProvider,
  Email,
  InvalidCredentialsException,
  UserStatus,
} from '@/modules/user/domain'
import { AuthProviderMismatchException } from '../../domain/exceptions/auth.exception'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { type SignInInputDto, type SignInOutputDto } from '../dto'
import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '@/modules/authorization/application/repositories/permission.repository'

@Injectable()
export class SignInWithEmailUseCase implements ISignInWithEmailUseCase {
  private readonly logger = new Logger(SignInWithEmailUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute({
    email,
    password,
    clientInfo,
  }: SignInInputDto): Promise<SignInOutputDto> {
    this.logger.log(`Initiating global sign-in for: ${email}`)

    // 1. Domain Validation
    const emailResult = Email.create(email)
    if (emailResult.isFailure) {
      throw new InvalidCredentialsException()
    }

    // 2. Repository Lookup
    const user = await this.userRepository.findByEmail(emailResult.value)
    if (!user) {
      throw new InvalidCredentialsException()
    }

    // 3. Security Check: Rate Limiting & Lockouts
    if (user.isLocked()) {
      throw new AccountLockedException(formatDistanceToNow(user.lockedUntil!))
    }

    // 4. Security Check: Account Status
    if (user.status !== UserStatus.ACTIVE) {
      throw new AccountInactiveException(user.status)
    }

    // 5. Ensure Auth Provider Is Email (Prevents OAuth bypass)
    if (!user.passwordHash || user.authProvider !== AuthProvider.EMAIL) {
      throw new AuthProviderMismatchException(user.authProvider)
    }

    // 6. Cryptographic Password Check
    const isValid = await this.authService.comparePassword(
      password,
      user.passwordHash.value
    )

    if (!isValid) {
      user.recordFailedLogin()
      await this.userRepository.save(user)
      throw new InvalidCredentialsException()
    }

    // 7. Record Successful Login (Domain behavior resets failed attempts)
    user.recordLogin()
    await this.userRepository.save(user)

    // 8. Generate Cryptographic Identifiers
    const jti = this.authService.generateSecureToken() // Unique ID for the JWT itself

    // 9. Initialize the Global Session (Redis)
    const sid = await this.authService.createSession({
      userId: user.id,
      email: user.email,
      jti,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    // 10. Mint the Global Identity JWT
    const refreshToken = await this.authService.createRefreshToken({
      jti,
      sub: user.id.value,
      sid, // Link the JWT to the Redis session for instant revocation
    })

    // 11. Extract precise expiration for the cookie configuration in the controller
    const expiresIn = this.authService.extractTokenExpiry(refreshToken)

    this.logger.log(
      `User ${user.id.value} successfully authenticated globally.`
    )

    return {
      refreshToken,
      expiresIn,
    }
  }
}
