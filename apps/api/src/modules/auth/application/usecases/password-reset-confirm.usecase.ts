import {
  Email,
  InvalidEmailException,
  InvalidPasswordException,
  Password,
  UserNotFoundException,
} from '@/modules/user/domain'
import { IPasswordResetConfirmUseCase } from './password-reset-confirm.interface'
import { Inject, Injectable } from '@nestjs/common'
import { InvalidOtpException } from '../../domain/exceptions/auth.exception'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import { PasswordResetConfirmRequestDto } from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
@Injectable()
export class PasswordResetConfirmUseCase implements IPasswordResetConfirmUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  async execute(dto: PasswordResetConfirmRequestDto): Promise<void> {
    const storedEmail = await this._authService.getPasswordResetToken(
      dto.resetToken
    )

    if (!storedEmail) throw new InvalidOtpException()

    const storedEmailResult = Email.create(storedEmail)
    const passwordResult = Password.create(dto.newPassword)

    if (storedEmailResult.isFailure)
      throw new InvalidEmailException(storedEmailResult.error)

    if (passwordResult.isFailure)
      throw new InvalidPasswordException(passwordResult.error)

    const user = await this._userRepository.findByEmail(storedEmailResult.value)

    if (!user) throw new UserNotFoundException()

    const hashedPassword = await this._authService.hashPassword(
      passwordResult.value
    )

    user.passwordHash = Password.fromHashed(hashedPassword)

    await this._userRepository.save(user)

    await this._authService.deletePasswordResetToken(dto.resetToken)
  }
}
