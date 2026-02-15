import { Inject, Injectable, Logger } from '@nestjs/common'
import { SignUpCommand } from '../dto/sign-up.command'
import { SignUpResult } from '../dto/sign-up.result'
import { ISignUpWithEmailUseCase } from './sign-up-with-email.interface'
import {
  AuthProvider,
  Email,
  InvalidEmailException,
  InvalidPasswordException,
  Password,
  User,
  UserAlreadyExistsException,
} from '@/modules/user/domain'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
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

@Injectable()
export class SignUpWithEmailUseCase implements ISignUpWithEmailUseCase {
  private readonly _logger = new Logger(SignUpWithEmailUseCase.name)

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
  async execute(command: SignUpCommand): Promise<SignUpResult> {
    const { firstName, lastName, email, password, clientInfo } = command

    // 1. Domain Validation
    const emailResult = Email.create(email)
    if (emailResult.isFailure) throw new InvalidEmailException(email)

    // 2. Repository lookup
    const existingUser = await this._userRepository.findByEmail(
      emailResult.value
    )
    if (existingUser) throw new UserAlreadyExistsException(emailResult.value)

    // 3. Domain validation
    const passwordResult = Password.create(password)
    if (passwordResult.isFailure)
      throw new InvalidPasswordException(passwordResult.error)

    // 4. Hash passoword
    const passwordHash = await this._passwordHasher.hash(passwordResult.value)

    // 5. Create new User
    const user = User.create({
      firstName,
      lastName,
      email: emailResult.value,
      passwordHash: Password.fromHashed(passwordHash),
      authProvider: AuthProvider.EMAIL,
    })

    // 6. Record login info
    user.recordLogin()

    // 7. Save the user
    await this._userRepository.save(user)

    const refreshTokenId = UuidUtil.generate()

    // 8. Create session
    const sessionId = await this._sessionManager.createSession({
      userId: user.id.value,
      jti: refreshTokenId,
      email: user.email.value,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    // 9. Generate refresh token
    const refreshToken = this._tokenGenerator.generateRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: sessionId,
    })

    this._logger.log(`User ${user.id.value} sign up successfully`)

    // 11. Return refresh token
    return {
      refreshToken,
    }
  }
}
