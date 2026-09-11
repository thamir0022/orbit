import { Inject, Injectable } from '@nestjs/common'
import { Email, InvalidEmailException } from '@/modules/user/domain'
import { IPasswordResetVerifyUseCase } from './password-reset-verify.interface'
import { Otp } from '../../domain/value-objects/otp.vo'
import { InvalidOtpException } from '../../domain/exceptions/auth.exception'
import {
  PasswordResetVerifyInputDto,
  PasswordResetVerifyOutputDto,
} from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'

@Injectable()
export class PasswordResetVerifyUseCase implements IPasswordResetVerifyUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  async execute(
    input: PasswordResetVerifyInputDto
  ): Promise<PasswordResetVerifyOutputDto> {
    const { email, otp } = input
    const emailResult = Email.create(email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const otpResult = Otp.create(otp)

    if (otpResult.isFailure) throw new InvalidOtpException()

    const storedOtp = await this._authService.getOtp(
      'password-reset',
      emailResult.value
    )

    if (!storedOtp) throw new InvalidOtpException()

    const storedOtpResult = Otp.create(storedOtp)

    if (storedOtpResult.isFailure) {
      await this._authService.deleteOtp('password-reset', emailResult.value)
      throw new InvalidOtpException()
    }

    if (!otpResult.value.equals(storedOtpResult.value))
      throw new InvalidOtpException()

    await this._authService.deleteOtp('password-reset', emailResult.value)

    const resetToken = this._authService.generateSecureToken()

    await this._authService.saveGrantToken(
      'password-reset',
      resetToken,
      emailResult.value
    )

    return { resetToken }
  }
}
