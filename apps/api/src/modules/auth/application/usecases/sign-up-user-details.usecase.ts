import { Inject } from '@nestjs/common'
import { IUserDetailsUseCase } from './sign-up-user-details.interface'
import { SignUpStep } from '../repositories/session-manager.interface'
import { SignUpSessionNotFoundException } from '../../domain/exceptions/auth.exception'
import { InvalidPasswordException, Password } from '@/modules/user/domain'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import {
  SignUpUserDetailsRequestDto,
  SignUpUserDetailsResponseDto,
} from '../dto'

export class UserDetailsUseCase implements IUserDetailsUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  async execute(
    dto: SignUpUserDetailsRequestDto
  ): Promise<SignUpUserDetailsResponseDto> {
    const signUpSession = await this._authService.getSignUpSession(
      dto.registrationToken
    )

    if (!signUpSession) throw new SignUpSessionNotFoundException()

    const passwordResult = Password.create(dto.password)

    if (passwordResult.isFailure)
      throw new InvalidPasswordException(passwordResult.error)

    const passwordHash = await this._authService.hashPassword(
      passwordResult.value
    )

    await this._authService.updateSignUpSession(dto.registrationToken, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      currentStep: SignUpStep.DETAILS_COMPLETED,
    })

    return { nextStep: 'organization_creation' }
  }
}
