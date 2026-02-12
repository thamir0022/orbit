import { Inject } from '@nestjs/common'
import { PasswordResetRequestCommand } from '../dto/password-reset-request.command'
import { IPasswordResetRequestUseCase } from './password-reset-request.interface'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  AccountInactiveException,
  Email,
  InvalidEmailException,
  UserStatus,
} from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'
import {
  OTP_MANAGER,
  type IOtpManager,
} from '../repositories/otp-manager.interface'

export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(OTP_MANAGER)
    private readonly _cacheManager: IOtpManager
  ) {}
  async execute(command: PasswordResetRequestCommand): Promise<void> {
    const { email } = command

    const emailResult = Email.create(email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const user = await this._userRepository.findByEmail(emailResult.value)

    if (!user) return

    if (user.status !== UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

    const generatedOtp = Otp.generate()

    await this._cacheManager.setOtp({
      email: emailResult.value,
      otp: generatedOtp,
    })

    // Send Email with OTP to client
  }
}
