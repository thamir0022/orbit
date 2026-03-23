import { Inject } from '@nestjs/common'
import { PasswordResetResendOtpRequestDto } from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { IPasswordResetResendOtpUseCase } from './password-reset-resend-otp.interface'
import { Email, InvalidEmailException } from '@/modules/user/domain'
import {
  MaxOtpRequestsExceededException,
  OtpAlreadySendException,
} from '../../domain/exceptions/auth.exception'

export class PasswordResetResendOtpUseCase implements IPasswordResetResendOtpUseCase {
  constructor(
    @Inject(AUTH_SERVICE) private readonly _authService: IAuthService
  ) {}

  async execute(dto: PasswordResetResendOtpRequestDto): Promise<void> {
    const emailResult = Email.create(dto.email)
    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const isCooldown = await this._authService.getPasswordResetCooldown(
      emailResult.value
    )

    if (isCooldown) throw new OtpAlreadySendException()

    const attempts = await this._authService.getPasswordResetAttempts(
      emailResult.value
    )

    const hasExceeded = this._authService.hasExceededOtpAttempts(attempts)

    if (hasExceeded) throw new MaxOtpRequestsExceededException()

    const newOtp = this._authService.generateOtp()

    await this._authService.setPasswordResetOtp(emailResult.value, newOtp)

    await this._authService.setPasswordResetAttempts(
      emailResult.value,
      (attempts ?? 0) + 1
    )

    await this._authService.setPasswordResetCooldown(emailResult.value)

    await this._authService.sendForgotPasswordEmail(emailResult.value, newOtp)
  }
}
