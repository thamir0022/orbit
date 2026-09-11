import { Inject } from '@nestjs/common'
import { PasswordResetResendOtpInputDto } from '../dto'
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

  async execute(input: PasswordResetResendOtpInputDto): Promise<void> {
    const { email } = input

    const emailResult = Email.create(email)
    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const isCooldown = await this._authService.isOtpOnCooldown(
      'password-reset',
      emailResult.value
    )

    if (isCooldown) throw new OtpAlreadySendException()

    const attempts = await this._authService.getOtpAttempts(
      'password-reset',
      emailResult.value
    )

    const hasExceeded = this._authService.hasExceededOtpAttempts(attempts)

    if (hasExceeded) throw new MaxOtpRequestsExceededException()

    const newOtp = this._authService.generateOtp()

    await this._authService.saveOtp('password-reset', emailResult.value, newOtp)

    await this._authService.incrementOtpAttempts(
      'password-reset',
      emailResult.value
    )

    await this._authService.setOtpCooldown('password-reset', emailResult.value)

    await this._authService.sendForgotPasswordEmail(emailResult.value, newOtp)
  }
}
