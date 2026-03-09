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
import { SignUpInititateWithEmailRequestDto } from '../dto'

@Injectable()
export class SignUpInitiateWithEmailUseCase implements ISignUpInitiateWithEmailUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService,
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository
  ) {}

  async execute(dto: SignUpInititateWithEmailRequestDto): Promise<null> {
    const emailResult = Email.create(dto.email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const isEmailExists = await this._userRepository.existsByEmail(
      emailResult.value
    )

    if (isEmailExists) return null

    const otp = this._authService.generateOtp()

    await this._authService.setEmailVerificationOtp(emailResult.value, otp)

    await this._authService.sendEmailVerificationEmail({
      email: emailResult.value,
      otp: otp,
    })

    return null
  }
}
