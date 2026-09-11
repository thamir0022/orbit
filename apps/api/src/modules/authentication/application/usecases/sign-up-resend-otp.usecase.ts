import { Inject, Injectable } from '@nestjs/common'
import { ISignupResendOtpUseCase } from './sign-up-resend-otp.interface'
import { SignUpResendOtpInput } from '../dto'
import { Email, InvalidEmailException } from '@/modules/user/domain'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  MaxOtpRequestsExceededException,
  OtpAlreadySendException,
} from '../../domain/exceptions/auth.exception'

@Injectable()
export class SignUpResendOtpUseCase implements ISignupResendOtpUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: SignUpResendOtpInput): Promise<void> {
    const emailResult = Email.create(input.email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const isEmailExists = await this.userRepository.existsByEmail(
      emailResult.value
    )

    if (isEmailExists) return

    const isCooldown = await this.authService.isOtpOnCooldown(
      'email-verification',
      emailResult.value
    )

    if (isCooldown) throw new OtpAlreadySendException()

    const attempts = await this.authService.getOtpAttempts(
      'email-verification',
      emailResult.value
    )

    const hasExceeded = this.authService.hasExceededOtpAttempts(attempts)

    if (hasExceeded) throw new MaxOtpRequestsExceededException()

    const newOtp = this.authService.generateOtp()

    await this.authService.saveOtp(
      'email-verification',
      emailResult.value,
      newOtp
    )

    await this.authService.incrementOtpAttempts(
      'email-verification',
      emailResult.value
    )

    await this.authService.setOtpCooldown(
      'email-verification',
      emailResult.value
    )

    await this.authService.sendEmailVerificationEmail(emailResult.value, newOtp)
  }
}
