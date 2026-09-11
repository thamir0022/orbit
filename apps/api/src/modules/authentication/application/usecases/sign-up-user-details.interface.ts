import { SignUpUserDetailsInputDto, SignUpUserDetailsOutputDto } from '../dto'

export interface IUserDetailsUseCase {
  execute(input: SignUpUserDetailsInputDto): Promise<SignUpUserDetailsOutputDto>
}

export const SIGN_UP_USER_DETAILS = Symbol('IUserDetailsUseCase')
