import { Inject, Injectable } from '@nestjs/common'
import { Email, InvalidEmailException } from '@/modules/user/domain'
import { IPasswordResetVerifyUseCase } from './password-reset-verify.interface'
import { Otp } from '../../domain/value-objects/otp.vo'
import { InvalidOtpException } from '../../domain/exceptions/auth.exception'
import {
  PasswordResetVerifyRequestDto,
  PasswordResetVerifyResponseDto,
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
    dto: PasswordResetVerifyRequestDto
  ): Promise<PasswordResetVerifyResponseDto> {
    const emailResult = Email.create(dto.email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const otpResult = Otp.create(dto.otp)

    if (otpResult.isFailure) throw new InvalidOtpException()

    const storedOtp = await this._authService.getPasswordResetOtp(
      emailResult.value
    )

    if (!storedOtp) throw new InvalidOtpException()

    const storedOtpResult = Otp.create(storedOtp)

    if (storedOtpResult.isFailure) {
      await this._authService.deletePasswordResetOtp(emailResult.value)
      throw new InvalidOtpException()
    }

    if (!otpResult.value.equals(storedOtpResult.value))
      throw new InvalidOtpException()

    await this._authService.deletePasswordResetOtp(emailResult.value)

    const resetToken = this._authService.generatePasswordResetToken()

    await this._authService.setPasswordResetToken(resetToken, emailResult.value)

    return { resetToken }
  }
}
