import { Inject } from '@nestjs/common'
import { Email, InvalidEmailException } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'
import { InvalidOtpException } from '../../domain/exceptions/auth.exception'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import {
  SignUpVerifyEmailWithOtpRequestDto,
  SignUpVerifyEmailWithOtpResponseDto,
} from '../dto'
import { ISignUpVerifyEmailWithOtpUseCase } from './sign-up-verify-email-with-otp.interface'

export class SignUpVerifyEmailUseCase implements ISignUpVerifyEmailWithOtpUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  async execute(
    dto: SignUpVerifyEmailWithOtpRequestDto
  ): Promise<SignUpVerifyEmailWithOtpResponseDto> {
    const emailResult = Email.create(dto.email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const otpResult = Otp.create(dto.code)

    if (otpResult.isFailure) throw new InvalidOtpException()

    const storedOtp = await this._authService.getEmailVerificationOtp(
      emailResult.value
    )

    if (!storedOtp) throw new InvalidOtpException()

    const storedOtpResult = Otp.create(storedOtp)

    if (storedOtpResult.isFailure) {
      await this._authService.deleteEmailVerificationOtp(emailResult.value)
      throw new InvalidOtpException()
    }

    if (!storedOtpResult.value.equals(otpResult.value))
      throw new InvalidOtpException()

    await this._authService.deleteEmailVerificationOtp(emailResult.value)

    const registrationToken = this._authService.createRegistrationToken()

    await this._authService.createSignUpSession(registrationToken, {
      email: emailResult.value.value,
      isEmailVerified: true,
    })

    return { registrationToken }
  }
}
