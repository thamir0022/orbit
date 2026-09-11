import { SignUpInititateWithEmailInputDto } from '../dto'

export interface ISignUpInitiateWithEmailUseCase {
  execute(input: SignUpInititateWithEmailInputDto): Promise<void>
}

export const SIGN_UP_INITIATE = Symbol('ISignUpInitiateWithEmailUseCase')
