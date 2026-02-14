import {
  Email,
  InvalidEmailException,
  InvalidPasswordException,
  Password,
  UserNotFoundException,
} from '@/modules/user/domain'
import { PasswordResetConfirmCommand } from '../dto/password-reset-confirm.command'
import { IPasswordResetConfirmUseCase } from './password-reset-confirm.interface'
import { Inject, Injectable } from '@nestjs/common'
import {
  type IOtpManager,
  OTP_MANAGER,
} from '../repositories/otp-manager.interface'
import { InvalidOtpException } from '../../domain/exceptions/auth.exception'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../repositories/password-hasher.interface'
@Injectable()
export class PasswordResetConfirmUseCase implements IPasswordResetConfirmUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly _passwordHasher: IPasswordHasher,
    @Inject(OTP_MANAGER)
    private readonly _cacheManager: IOtpManager
  ) {}

  async execute(command: PasswordResetConfirmCommand): Promise<void> {
    const { resetToken, newPassword } = command

    const storedEmail = await this._cacheManager.getResetOtpToken(resetToken)

    if (!storedEmail) throw new InvalidOtpException()

    const storedEmailResult = Email.create(storedEmail)
    const passwordResult = Password.create(newPassword)

    if (storedEmailResult.isFailure)
      throw new InvalidEmailException(storedEmailResult.error)

    if (passwordResult.isFailure)
      throw new InvalidPasswordException(passwordResult.error)

    const user = await this._userRepository.findByEmail(storedEmailResult.value)

    if (!user) throw new UserNotFoundException()

    const hashedPassword = await this._passwordHasher.hash(passwordResult.value)

    user.passwordHash = Password.fromHashed(hashedPassword)

    await this._userRepository.save(user)

    await this._cacheManager.deteleResetOtpToken(resetToken)

    return
  }
}
