import {
  SignUpUserDetailsRequestDto,
  SignUpUserDetailsResponseDto,
} from '../dto'

export interface IUserDetailsUseCase {
  execute(
    dto: SignUpUserDetailsRequestDto
  ): Promise<SignUpUserDetailsResponseDto>
}

export const SIGN_UP_USER_DETAILS = Symbol('IUserDetailsUseCase')
