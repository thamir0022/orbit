import { SignInRequestDto, SignInResponseDto } from '../dto'

export interface ISignInWithEmailUseCase {
  execute(command: SignInRequestDto): Promise<SignInResponseDto>
}

export const SIGN_IN_WITH_EMAIL = Symbol('ISignInWithEmailUseCase')
