import { Inject } from '@nestjs/common'
import { Email, InvalidEmailException } from '@/modules/user/domain'
import { Otp } from '../../domain/value-objects/otp.vo'
import { InvalidOtpException } from '../../domain/exceptions/auth.exception'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import {
  SignUpVerifyEmailWithOtpInputDto,
  SignUpVerifyEmailWithOtpOutputDto,
} from '../dto'
import { ISignUpVerifyEmailWithOtpUseCase } from './sign-up-verify-email-with-otp.interface'

export class SignUpVerifyEmailUseCase implements ISignUpVerifyEmailWithOtpUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  async execute({
    email,
    code,
  }: SignUpVerifyEmailWithOtpInputDto): Promise<SignUpVerifyEmailWithOtpOutputDto> {
    const emailResult = Email.create(email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const otpResult = Otp.create(code)

    if (otpResult.isFailure) throw new InvalidOtpException()

    const storedOtp = await this._authService.getOtp(
      'email-verification',
      emailResult.value
    )

    if (!storedOtp) throw new InvalidOtpException()

    const storedOtpResult = Otp.create(storedOtp)

    if (storedOtpResult.isFailure) {
      await this._authService.deleteOtp('email-verification', emailResult.value)
      throw new InvalidOtpException()
    }

    if (!storedOtpResult.value.equals(otpResult.value))
      throw new InvalidOtpException()

    await this._authService.deleteOtp('email-verification', emailResult.value)

    const registrationToken = this._authService.generateSecureToken()

    await this._authService.initializeOnboardingFlow({
      registrationToken,
      email: emailResult.value,
    })

    return { registrationToken }
  }
}
