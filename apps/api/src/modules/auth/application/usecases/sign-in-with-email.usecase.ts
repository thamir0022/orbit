import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISignInWithEmailUseCase } from './sign-in-with-email.interface'
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
import { formatDistanceToNow } from 'date-fns'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { AuthProviderMismatchException } from '../../domain/exceptions/auth.exception'
import { SignInRequestDto, SignInResponseDto } from '../dto'

@Injectable()
export class SignInWithEmailUseCase implements ISignInWithEmailUseCase {
  private readonly _logger = new Logger(SignInWithEmailUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  async execute({
    email,
    password,
    clientInfo,
  }: SignInRequestDto): Promise<SignInResponseDto> {
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

    // 4. Check Account Status
    if (user.status !== UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

    // 5. Ensure Auth Provider Is Email
    if (!user.passwordHash || user.authProvider !== AuthProvider.EMAIL)
      throw new AuthProviderMismatchException(user.authProvider)

    // 6. Password Check
    const isValid = await this._authService.comparePassword(
      password,
      user.passwordHash.value
    )

    if (!isValid) {
      user.recordFailedLogin()
      await this._userRepository.save(user)
      throw new InvalidCredentialsException()
    }

    // 7. Record successful login (Domain behavior)
    user.recordLogin()

    // 8. Save the user
    await this._userRepository.save(user)

    // 9. Generate a refresh token ID
    const refreshTokenId = this._authService.createRefreshTokenId()

    // 10. Create session
    const sessionId = await this._authService.createAuthSession({
      userId: user.id,
      email: user.email,
      jti: refreshTokenId,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    // 11. Generate refresh token
    const refreshToken = await this._authService.createRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: sessionId,
    })

    // 12. Calculate the refreshToken expiry
    const expiresIn = this._authService.extractRefreshTokenExpiry(refreshToken)

    this._logger.log(`User ${user.id.value} sign in successfully`)
    // 13. Return the refresh token and expiry
    return {
      refreshToken,
      expiresIn,
    }
  }
}
