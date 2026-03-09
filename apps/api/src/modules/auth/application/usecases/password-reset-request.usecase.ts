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
import { PasswordResetRequestDto } from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'

@Injectable()
export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}
  async execute(dto: PasswordResetRequestDto): Promise<void> {
    const emailResult = Email.create(dto.email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const user = await this._userRepository.findByEmail(emailResult.value)

    if (!user) return

    if (user.status !== UserStatus.ACTIVE)
      throw new AccountInactiveException(user.status)

    const generatedOtp = this._authService.generateOtp()

    await this._authService.setPasswordResetOtp(emailResult.value, generatedOtp)

    // Send Email with OTP to client
    await this._authService.sendForgotPasswordEmail(
      emailResult.value,
      generatedOtp
    )
  }
}
