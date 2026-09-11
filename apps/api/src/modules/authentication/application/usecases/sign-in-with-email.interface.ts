import { SignInInputDto, SignInOutputDto } from '../dto'

export interface ISignInWithEmailUseCase {
  execute(input: SignInInputDto): Promise<SignInOutputDto>
}

export const SIGN_IN_WITH_EMAIL = Symbol('ISignInWithEmailUseCase')
