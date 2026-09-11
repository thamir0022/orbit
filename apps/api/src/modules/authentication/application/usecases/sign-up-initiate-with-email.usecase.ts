import { Inject, Injectable } from '@nestjs/common'
import { Email, InvalidEmailException } from '@/modules/user/domain'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { ISignUpInitiateWithEmailUseCase } from './sign-up-initiate-with-email.interface'
import { SignUpInititateWithEmailInputDto } from '../dto'

@Injectable()
export class SignUpInitiateWithEmailUseCase implements ISignUpInitiateWithEmailUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService,
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository
  ) {}

  async execute({ email }: SignUpInititateWithEmailInputDto): Promise<void> {
    const emailResult = Email.create(email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const isEmailExists = await this._userRepository.existsByEmail(
      emailResult.value
    )

    if (isEmailExists) return

    const otp = this._authService.generateOtp()

    await this._authService.saveOtp(
      'email-verification',
      emailResult.value,
      otp
    )

    await this._authService.incrementOtpAttempts(
      'email-verification',
      emailResult.value
    )

    await this._authService.sendEmailVerificationEmail(emailResult.value, otp)
  }
}
