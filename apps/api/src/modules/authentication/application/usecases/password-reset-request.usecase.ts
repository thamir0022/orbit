import { Inject, Injectable } from '@nestjs/common'
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
import { PasswordResetRequestInputDto } from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import {
  MaxOtpRequestsExceededException,
  OtpAlreadySendException,
} from '../../domain/exceptions/auth.exception'

@Injectable()
export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}
  async execute(input: PasswordResetRequestInputDto): Promise<void> {
    const { email } = input
    const emailResult = Email.create(email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const user = await this._userRepository.findByEmail(emailResult.value)

    if (!user) return

    if (user.status !== UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

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

    const generatedOtp = this._authService.generateOtp()

    await this._authService.saveOtp(
      'password-reset',
      emailResult.value,
      generatedOtp
    )

    await this._authService.incrementOtpAttempts(
      'password-reset',
      emailResult.value
    )

    // Send Email with OTP to client
    await this._authService.sendForgotPasswordEmail(
      emailResult.value,
      generatedOtp
    )
  }
}
