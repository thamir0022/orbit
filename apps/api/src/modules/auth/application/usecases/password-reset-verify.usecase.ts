import { Email, InvalidEmailException } from '@/modules/user/domain'
import { PasswordResetVerifyCommand } from '../dto/password-reset-verify.command'
import { PasswordResetVerifyResult } from '../dto/password-reset-verify.result'
import { IPasswordResetVerifyUseCase } from './password-reset-verify.interface'
import { Otp } from '../../domain/value-objects/otp.vo'
import { InvalidOtpException } from '../../domain/exceptions/auth.exception'
import { Inject } from '@nestjs/common'
import {
  type IOtpManager,
  OTP_MANAGER,
} from '../repositories/otp-manager.interface'
import { UuidUtil } from '@/shared/utils'

export class PasswordResetVerifyUseCase implements IPasswordResetVerifyUseCase {
  constructor(
    @Inject(OTP_MANAGER)
    private readonly _cacheManager: IOtpManager
  ) {}

  async execute(
    command: PasswordResetVerifyCommand
  ): Promise<PasswordResetVerifyResult> {
    const { email, otp } = command

    const emailResult = Email.create(email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const otpResult = Otp.create(otp)

    if (otpResult.isFailure) throw new InvalidOtpException()

    const storedOtp = await this._cacheManager.getOtp(emailResult.value)

    if (!storedOtp) throw new InvalidOtpException()

    if (!otpResult.value.equals(Otp.create(storedOtp).value))
      throw new InvalidOtpException()

    await this._cacheManager.deleteOtp(emailResult.value)

    const resetToken = UuidUtil.generate()

    await this._cacheManager.setResetOtpToken({
      email: emailResult.value,
      resetToken,
    })

    return { resetToken }
  }
}
