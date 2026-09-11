import { Inject } from '@nestjs/common'
import { IUserDetailsUseCase } from './sign-up-user-details.interface'
import { SignUpStep } from '../ports/onboarding-cache.interface'
import { SignUpSessionNotFoundException } from '../../domain/exceptions/auth.exception'
import { InvalidPasswordException, Password } from '@/modules/user/domain'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { SignUpUserDetailsInputDto, SignUpUserDetailsOutputDto } from '../dto'

export class UserDetailsUseCase implements IUserDetailsUseCase {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  async execute({
    registrationToken,
    ...userData
  }: SignUpUserDetailsInputDto): Promise<SignUpUserDetailsOutputDto> {
    const signUpSession =
      await this._authService.getOnboardingState(registrationToken)

    if (!signUpSession) throw new SignUpSessionNotFoundException()

    const passwordResult = Password.create(userData.password)

    if (passwordResult.isFailure)
      throw new InvalidPasswordException(passwordResult.error)

    const passwordHash = await this._authService.hashPassword(
      passwordResult.value
    )

    await this._authService.updateOnboardingState(registrationToken, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordHash,
      currentStep: SignUpStep.DETAILS_COMPLETED,
    })

    return { nextStep: 'workspace_creation' }
  }
}
